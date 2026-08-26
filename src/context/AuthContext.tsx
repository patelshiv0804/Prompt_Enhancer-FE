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
  logout: () => Promise<void>;
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
    // The backend has already set the JWT in an httpOnly cookie on the login
    // response (VULN-017); we no longer persist it in localStorage. Keep the
    // token in memory only for backwards compatibility of the context field.
    setToken(accessToken);

    const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
    setUser(profile);

    await refreshStyleProfiles();
    router.replace('/dashboard/optimizer');
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
      // Auth now rides on an httpOnly cookie the browser sends automatically.
      // Probe /profile/me: success means we have a valid session, a 401 means
      // we're logged out. No token is read from localStorage anymore (VULN-017/019).
      try {
        const profile = await apiClient.get<UserProfile>('/api/v1/profile/me');
        setUser(profile);
        const styles = await apiClient.get<StyleProfile[]>('/api/v1/styles');
        setStyleProfiles(styles || []);
      } catch {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    }
    loadAuth();

    const handleStyleUpdate = () => {
      refreshStyleProfiles();
    };

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setStyleProfiles([]);
      setActiveStyle({ id: null, name: 'None' });
      // Clearing auth state above is always correct on a 401. Only force a
      // redirect when the user is inside a protected (dashboard) route; on
      // public pages (landing, /auth) we stay put so the visitor can browse
      // the home page or choose to log in themselves. AuthGuard still guards
      // the dashboard, and a session that expires there still lands here.
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
        router.push('/auth');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aure_style_memory_updated', handleStyleUpdate);
      window.addEventListener('storage', handleStyleUpdate);
      window.addEventListener('aure_unauthorized', handleUnauthorized);
      window.addEventListener('promptiq:unauthorized', handleUnauthorized);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aure_style_memory_updated', handleStyleUpdate);
        window.removeEventListener('storage', handleStyleUpdate);
        window.removeEventListener('aure_unauthorized', handleUnauthorized);
        window.removeEventListener('promptiq:unauthorized', handleUnauthorized);
      }
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/login', formData);
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('promptiq_access_token', response.access_token);
      }
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
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('promptiq_access_token', response.access_token);
      }
      await finalizeAuthentication(response.access_token);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Ask the backend to clear the httpOnly cookie; it isn't reachable from JS.
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Even if the call fails, drop local state so the UI logs out.
    }
    localStorage.removeItem('token');
    localStorage.removeItem('promptiq_access_token');
    setToken(null);
    setUser(null);
    setStyleProfiles([]);
    setActiveStyle({ id: null, name: 'None' });
    router.push('/');
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
        isAuthenticated: !!user,
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
