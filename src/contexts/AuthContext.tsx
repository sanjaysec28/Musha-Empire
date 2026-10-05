import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  resetPassword: (email: string, redirectTo?: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // If Supabase is not configured, load from local state/storage
    if (!isSupabaseConfigured) {
      try {
        const savedLocalUser = localStorage.getItem('musha_local_user');
        if (savedLocalUser) {
          const parsed = JSON.parse(savedLocalUser);
          setUser(parsed);
          setSession({ user: parsed, access_token: 'mock-token' } as unknown as Session);
        }
      } catch (err) {
        console.warn('Could not restore local demo session:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.warn('Notice fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, options?: any) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: `patron_${Date.now()}`,
        email,
        user_metadata: {
          name: options?.data?.name || email.split('@')[0],
          phone: options?.data?.phone || '+1 (555) 019-2834',
        },
      } as unknown as User;
      const mockSession = { user: mockUser, access_token: 'mock-jwt-token' } as unknown as Session;
      setUser(mockUser);
      setSession(mockSession);
      try {
        localStorage.setItem('musha_local_user', JSON.stringify(mockUser));
      } catch (e) {
        console.warn('LocalStorage error saving demo user:', e);
      }
      return { user: mockUser, session: mockSession };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) throw error;
    return data;
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'patron_vip_001',
        email,
        user_metadata: {
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          phone: '+1 (555) 019-2834',
        },
      } as unknown as User;
      const mockSession = { user: mockUser, access_token: 'mock-jwt-token' } as unknown as Session;
      setUser(mockUser);
      setSession(mockSession);
      try {
        localStorage.setItem('musha_local_user', JSON.stringify(mockUser));
      } catch (e) {
        console.warn('LocalStorage error saving demo user:', e);
      }
      return { user: mockUser, session: mockSession };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      try {
        localStorage.removeItem('musha_local_user');
      } catch (e) {
        console.warn('LocalStorage error clearing demo user:', e);
      }
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
