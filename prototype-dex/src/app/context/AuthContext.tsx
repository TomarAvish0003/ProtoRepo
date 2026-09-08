'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  getMe,
  loginUser,
  registerUser,
  logoutUser,
  toggleFavoriteApi,
  toggleCaughtApi,
  syncGuestData,
} from '@/app/utils/api';
import { UserProfile } from '@/app/utils/types';

const GUEST_FAVORITES_KEY = 'protodex_guest_favorites';
const GUEST_CAUGHT_KEY = 'protodex_guest_caught';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  favorites: string[];
  caught: string[];
  isFavorite: (pokemonNameOrId: string | number) => boolean;
  isCaught: (pokemonNameOrId: string | number) => boolean;
  toggleFavorite: (pokemonNameOrId: string | number) => Promise<boolean>;
  toggleCaught: (pokemonNameOrId: string | number) => Promise<boolean>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncGuestToCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [caught, setCaught] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to read local guest storage
  const getGuestData = useCallback(() => {
    if (typeof window === 'undefined') return { guestFavs: [], guestCaught: [] };
    try {
      const favsRaw = localStorage.getItem(GUEST_FAVORITES_KEY);
      const caughtRaw = localStorage.getItem(GUEST_CAUGHT_KEY);
      const guestFavs: string[] = favsRaw ? JSON.parse(favsRaw) : [];
      const guestCaught: string[] = caughtRaw ? JSON.parse(caughtRaw) : [];
      return { guestFavs, guestCaught };
    } catch {
      return { guestFavs: [], guestCaught: [] };
    }
  }, []);

  // Helper to clear local guest storage
  const clearGuestData = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_FAVORITES_KEY);
    localStorage.removeItem(GUEST_CAUGHT_KEY);
  }, []);

  // Sync guest data into user account upon login/register
  const syncGuestToCloud = useCallback(async () => {
    const { guestFavs, guestCaught } = getGuestData();
    if (guestFavs.length === 0 && guestCaught.length === 0) return;

    try {
      const res = await syncGuestData(guestFavs, guestCaught);
      if (res.data) {
        setFavorites(res.data.favorites);
        setCaught(res.data.caught);
        clearGuestData();
        const total = res.data.syncedFavoritesCount + res.data.syncedCaughtCount;
        if (total > 0) {
          toast.success(`Merged ${total} local Pokémon from this device into your account!`);
        }
      }
    } catch (err) {
      console.error('Failed to sync guest data:', err);
    }
  }, [getGuestData, clearGuestData]);

  // Load session from HttpOnly cookie via /api/auth/me on mount
  const refreshProfile = useCallback(async () => {
    try {
      const { data, error: meError } = await getMe();
      if (!meError && data?.user) {
        setUser(data.user);
        setFavorites(data.user.favorites || []);
        setCaught(data.user.caught || []);
        setError(null);
      } else {
        // Unauthenticated -> load guest state from localStorage
        setUser(null);
        const { guestFavs, guestCaught } = getGuestData();
        setFavorites(guestFavs);
        setCaught(guestCaught);
      }
    } catch {
      setUser(null);
      const { guestFavs, guestCaught } = getGuestData();
      setFavorites(guestFavs);
      setCaught(guestCaught);
    } finally {
      setLoading(false);
    }
  }, [getGuestData]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Helper checks
  const isFavorite = useCallback(
    (pokemonNameOrId: string | number) => {
      const key = String(pokemonNameOrId).toLowerCase().trim();
      return favorites.includes(key);
    },
    [favorites]
  );

  const isCaught = useCallback(
    (pokemonNameOrId: string | number) => {
      const key = String(pokemonNameOrId).toLowerCase().trim();
      return caught.includes(key);
    },
    [caught]
  );

  // Optimistic Toggle Favorite with rollback
  const toggleFavorite = useCallback(
    async (pokemonNameOrId: string | number): Promise<boolean> => {
      const key = String(pokemonNameOrId).toLowerCase().trim();
      const currentlyFavorite = favorites.includes(key);
      const willBeFavorite = !currentlyFavorite;

      // 1. Optimistic UI update
      setFavorites((prev) =>
        willBeFavorite ? [...prev, key] : prev.filter((k) => k !== key)
      );

      // 2. If logged in, persist to backend
      if (user) {
        try {
          const res = await toggleFavoriteApi(key);
          if (res.error || !res.data) {
            // Rollback on failure
            setFavorites((prev) =>
              currentlyFavorite ? [...prev, key] : prev.filter((k) => k !== key)
            );
            toast.error(res.error || 'Failed to update favorite');
            return currentlyFavorite;
          }
          setFavorites(res.data.favorites);
          toast.success(
            willBeFavorite
              ? `Added ${key.toUpperCase()} to Favorites`
              : `Removed ${key.toUpperCase()} from Favorites`
          );
          return willBeFavorite;
        } catch {
          // Rollback on error
          setFavorites((prev) =>
            currentlyFavorite ? [...prev, key] : prev.filter((k) => k !== key)
          );
          toast.error('Network error updating favorites');
          return currentlyFavorite;
        }
      } else {
        // 3. Guest Mode (persist to localStorage)
        try {
          const { guestFavs } = getGuestData();
          const nextFavs = willBeFavorite
            ? Array.from(new Set([...guestFavs, key]))
            : guestFavs.filter((k) => k !== key);
          localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(nextFavs));
          toast.info(
            willBeFavorite
              ? `Saved ${key.toUpperCase()} to local favorites (Guest Mode)`
              : `Removed ${key.toUpperCase()} from local favorites`
          );
        } catch {
          // ignore
        }
        return willBeFavorite;
      }
    },
    [favorites, user, getGuestData]
  );

  // Optimistic Toggle Caught with rollback
  const toggleCaught = useCallback(
    async (pokemonNameOrId: string | number): Promise<boolean> => {
      const key = String(pokemonNameOrId).toLowerCase().trim();
      const currentlyCaught = caught.includes(key);
      const willBeCaught = !currentlyCaught;

      // 1. Optimistic UI update
      setCaught((prev) =>
        willBeCaught ? [...prev, key] : prev.filter((k) => k !== key)
      );

      // 2. If logged in, persist to backend
      if (user) {
        try {
          const res = await toggleCaughtApi(key);
          if (res.error || !res.data) {
            // Rollback on failure
            setCaught((prev) =>
              currentlyCaught ? [...prev, key] : prev.filter((k) => k !== key)
            );
            toast.error(res.error || 'Failed to log catch');
            return currentlyCaught;
          }
          setCaught(res.data.caught);
          toast.success(
            willBeCaught
              ? `Logged catch for ${key.toUpperCase()}!`
              : `Removed ${key.toUpperCase()} from Caught Log`
          );
          return willBeCaught;
        } catch {
          // Rollback on error
          setCaught((prev) =>
            currentlyCaught ? [...prev, key] : prev.filter((k) => k !== key)
          );
          toast.error('Network error logging catch');
          return currentlyCaught;
        }
      } else {
        // 3. Guest Mode (persist to localStorage)
        try {
          const { guestCaught } = getGuestData();
          const nextCaught = willBeCaught
            ? Array.from(new Set([...guestCaught, key]))
            : guestCaught.filter((k) => k !== key);
          localStorage.setItem(GUEST_CAUGHT_KEY, JSON.stringify(nextCaught));
          toast.info(
            willBeCaught
              ? `Logged catch for ${key.toUpperCase()} locally (Guest Mode)`
              : `Removed ${key.toUpperCase()} from local catches`
          );
        } catch {
          // ignore
        }
        return willBeCaught;
      }
    },
    [caught, user, getGuestData]
  );

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error: logError } = await loginUser(email, password);
    if (logError || !data?.user) {
      setError(logError || 'Login failed');
      setLoading(false);
      return { success: false, error: logError || 'Login failed' };
    }

    setUser(data.user);
    setFavorites(data.user.favorites || []);
    setCaught(data.user.caught || []);
    setLoading(false);
    toast.success(`Welcome back, Trainer ${data.user.username}!`);

    // Sync any local guest data into the account
    await syncGuestToCloud();

    return { success: true };
  };

  // Register
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error: regError } = await registerUser(username, email, password);
    if (regError || !data?.user) {
      setError(regError || 'Registration failed');
      setLoading(false);
      return { success: false, error: regError || 'Registration failed' };
    }

    setUser(data.user);
    setFavorites(data.user.favorites || []);
    setCaught(data.user.caught || []);
    setLoading(false);
    toast.success(`Trainer Profile created! Welcome, ${data.user.username}!`);

    // Sync any local guest data into the account
    await syncGuestToCloud();

    return { success: true };
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    // Reload fresh guest state
    const { guestFavs, guestCaught } = getGuestData();
    setFavorites(guestFavs);
    setCaught(guestCaught);
    toast.info('Signed out of ProtoDex');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        favorites,
        caught,
        isFavorite,
        isCaught,
        toggleFavorite,
        toggleCaught,
        login,
        register,
        logout,
        refreshProfile,
        syncGuestToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
