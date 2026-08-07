'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  plan: string;
  avatar_url: string | null;
}

interface StyleProfile {
  id: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  styleProfiles: StyleProfile[];
  activeStyle: { id: string | null; name: string };
  setActiveStyle: (style: { id: string | null; name: string }) => void;
  activeTarget: string;
  setActiveTarget: (target: string) => void;
  activeEngine: string;
  setActiveEngine: (engine: string) => void;
  refreshStyleProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Style and target states shared globally
  const [styleProfiles, setStyleProfiles] = useState<StyleProfile[]>([]);
  const [activeStyle, setActiveStyle] = useState<{ id: string | null; name: string }>({ id: null, name: 'None' });
  const [activeTarget, setActiveTarget] = useState('ChatGPT');
  const [activeEngine, setActiveEngine] = useState('Claude Sonnet 4.5');

  const router = useRouter();

  const refreshStyleProfiles = async () => {
    try {
      const response = await apiClient.get<StyleProfile[]>('/api/v1/styles');
      setStyleProfiles(response || []);
    } catch (err) {
      console.error('Failed to fetch style profiles:', err);
    }
  };

  // Load token on mount and fetch user profile
  useEffect(() => {
    async function loadAuth() {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('promptiq_token');
        if (storedToken) {
          setToken(storedToken);
          try {
            const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
            setUser(profile);
            // Fetch styles
            const styles = await apiClient.get<StyleProfile[]>('/api/v1/styles');
            setStyleProfiles(styles || []);
          } catch (err) {
            console.error('Failed to load user profile, logging out:', err);
            localStorage.removeItem('promptiq_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/login', formData);
      const accessToken = response.access_token;

      localStorage.setItem('promptiq_token', accessToken);
      setToken(accessToken);

      const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
      setUser(profile);

      // Fetch styles list
      await refreshStyleProfiles();

      router.push('/dashboard/optimizer');
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      await apiClient.post('/api/v1/auth/register', {
        email,
        password,
        display_name: fullName || null,
      });

      // Immediately log in user after successful registration
      await login(email, password);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('promptiq_token');
    }
    setToken(null);
    setUser(null);
    setStyleProfiles([]);
    setActiveStyle({ id: null, name: 'None' });
    router.push('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        styleProfiles,
        activeStyle,
        setActiveStyle,
        activeTarget,
        setActiveTarget,
        activeEngine,
        setActiveEngine,
        refreshStyleProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
