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
  role?: string | null;
  onboarding_completed?: boolean;
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
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  styleProfiles: StyleProfile[];
  activeStyle: { id: string | null; name: string };
  setActiveStyle: (style: { id: string | null; name: string }) => void;
  activeTarget: string;
  setActiveTarget: (target: string) => void;
  activeEngine: string;
  setActiveEngine: (engine: string) => void;
  refreshStyleProfiles: () => Promise<void>;
  // Forgot Password
  sendPasswordResetOtp: (email: string) => Promise<void>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<string>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [styleProfiles, setStyleProfiles] = useState<StyleProfile[]>([]);
  const [activeStyle, setActiveStyle] = useState<{ id: string | null; name: string }>({ id: null, name: 'None' });
  const [activeTarget, setActiveTarget] = useState('ChatGPT');
  const [activeEngine, setActiveEngine] = useState('Claude Sonnet 4.5');

  const router = useRouter();

  const finalizeAuthentication = async (accessToken: string) => {
    localStorage.setItem('promptiq_token', accessToken);
    setToken(accessToken);

    const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
    setUser(profile);

    await refreshStyleProfiles();
    router.push('/dashboard/optimizer');
  };

  const refreshUserProfile = async () => {
    try {
      const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
      setUser(profile);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const refreshStyleProfiles = async () => {
    try {
      const response = await apiClient.get<StyleProfile[]>('/api/v1/styles');
      setStyleProfiles(response || []);
    } catch (err) {
      console.error('Failed to fetch style profiles:', err);
    }
  };

  useEffect(() => {
    async function loadAuth() {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('promptiq_token');
        if (storedToken) {
          setToken(storedToken);
          try {
            const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
            setUser(profile);
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

    const handleStyleUpdate = () => {
      refreshStyleProfiles();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('aure_style_memory_updated', handleStyleUpdate);
      window.addEventListener('storage', handleStyleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aure_style_memory_updated', handleStyleUpdate);
        window.removeEventListener('storage', handleStyleUpdate);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/login', formData);
      await finalizeAuthentication(response.access_token);
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
      await login(email, password);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/google', {
        id_token: idToken,
      });
      await finalizeAuthentication(response.access_token);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
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

  // ── Forgot Password helpers ───────────────────────────────────────────────

  /** Send a password-reset OTP to the given email. */
  const sendPasswordResetOtp = async (email: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/forgot-password', { email });
  };

  /**
   * Verify the OTP entered by the user.
   * Returns a short-lived reset token on success.
   */
  const verifyPasswordResetOtp = async (email: string, otp: string): Promise<string> => {
    const response = await apiClient.post<{ reset_token: string }>(
      '/api/v1/auth/verify-reset-otp',
      { email, otp }
    );
    return response.reset_token;
  };

  /** Set a new password using the reset token from OTP verification. */
  const resetPassword = async (resetToken: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/reset-password', {
      reset_token: resetToken,
      new_password: newPassword,
    });
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
        loginWithGoogle,
        logout,
        refreshUserProfile,
        styleProfiles,
        activeStyle,
        setActiveStyle,
        activeTarget,
        setActiveTarget,
        activeEngine,
        setActiveEngine,
        refreshStyleProfiles,
        sendPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPassword,
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
