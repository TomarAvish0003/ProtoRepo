'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getProfile, loginUser, registerUser } from '@/app/utils/api';

interface AuthContextType {
  user: { email: string; username: string } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    getProfile(token).then((response) => {
      // Explicitly type data to include username and email
      const { data, error } = response as { data: { email: string; username: string } | null, error: string | null };
      if (error || !data || !data.username) {
        setUser(null);
        setError(error || 'Profile data incomplete');
      } else {
        setUser({ email: data.email, username: data.username });
        setError(null);
      }
      setLoading(false);
    });
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await loginUser(email, password);
    if (error || !data) {
      setError(error || 'Login failed');
      setLoading(false);
      return false;
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setLoading(false);
    return true;
  };

  // Register function (now includes username)
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: regError } = await registerUser(username, email, password);
    if (regError) {
      setError(regError || 'Registration failed');
      setLoading(false);
      return false;
    }
    // Auto-login after registration
    return await login(email, password);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Refresh profile (e.g., after update)
  const refreshProfile = async () => {
    if (!token) return;
    setLoading(true);
    const { data, error } = await getProfile(token);
    // Explicitly type data to include username and email
    const profile = data as { email: string; username: string } | null;
    if (
      error ||
      !profile ||
      typeof profile.email !== 'string' ||
      typeof profile.username !== 'string'
    ) {
      setUser(null);
      setError(error || 'Profile data incomplete');
    } else {
      setUser({ email: profile.email, username: profile.username });
      setError(null);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy usage
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
