/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import {
  subscribeToFirebaseAuth,
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  firebaseSignOut,
  firebaseSendPasswordReset,
  firebaseSignInWithGoogle,
  firebaseSendPhoneOtp,
  firebaseConfirmPhoneOtp
} from '../lib/firebaseAuth';
import { usersRepository } from '../lib/firestoreService';
import { FirestoreUser } from '../types/firestore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppUserMetadata {
  name?: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

export interface AppUser {
  id: string;
  uid: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  displayName?: string;
  role: 'customer' | 'admin' | 'staff';
  user_metadata: AppUserMetadata;
  firebaseUser?: FirebaseUser | null;
  firestoreProfile?: FirestoreUser | null;
}

export interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  profile: FirestoreUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseActive: boolean;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<any>;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (
    confirmationResult: ConfirmationResult,
    code: string,
    metadata?: { name?: string; email?: string }
  ) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --------------------------------------------------------------------------
  // AUTH STATE LISTENER: FIREBASE (PRIMARY) vs SUPABASE (FALLBACK)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    if (isFirebaseConfigured && auth) {
      const unsubscribe = subscribeToFirebaseAuth(async (fbUser: FirebaseUser | null) => {
        if (!isMounted) return;

        if (fbUser) {
          try {
            const userProfile = await usersRepository.ensureProfile(
              fbUser.uid,
              fbUser.email,
              fbUser.phoneNumber,
              fbUser.displayName || undefined
            );
            if (isMounted) {
              setProfile(userProfile);
              const mappedUser: AppUser = {
                id: fbUser.uid,
                uid: fbUser.uid,
                email: fbUser.email || userProfile?.email || '',
                phone: fbUser.phoneNumber || userProfile?.phone || '',
                phoneNumber: fbUser.phoneNumber || userProfile?.phone || '',
                displayName: userProfile?.fullName || userProfile?.full_name || fbUser.displayName || 'Royal Patron',
                role: userProfile?.role || 'customer',
                user_metadata: {
                  name: userProfile?.fullName || userProfile?.full_name || fbUser.displayName || 'Royal Patron',
                  phone: fbUser.phoneNumber || userProfile?.phone || '',
                  role: userProfile?.role || 'customer',
                },
                firebaseUser: fbUser,
                firestoreProfile: userProfile,
              };
              setUser(mappedUser);
              const token = await fbUser.getIdToken().catch(() => 'fb-token');
              setSession({
                user: mappedUser as unknown as SupabaseUser,
                access_token: token,
              } as unknown as Session);
            }
          } catch (err) {
            console.warn('Notice setting up user profile in Firestore:', err);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setProfile(null);
            setSession(null);
          }
        }
        if (isMounted) setLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    // ------------------------------------------------------------------------
    // SUPABASE TEMPORARY FALLBACK (WHEN FIREBASE KEYS ARE NOT POPULATED)
    // ------------------------------------------------------------------------
    if (!isSupabaseConfigured) {
      try {
        const savedLocalUser = localStorage.getItem('musha_local_user');
        if (savedLocalUser) {
          const parsed = JSON.parse(savedLocalUser);
          const mappedUser: AppUser = {
            id: parsed.id || 'patron_vip_001',
            uid: parsed.id || 'patron_vip_001',
            email: parsed.email || '',
            phone: parsed.user_metadata?.phone || '',
            phoneNumber: parsed.user_metadata?.phone || '',
            displayName: parsed.user_metadata?.name || 'Royal Patron',
            role: 'customer',
            user_metadata: parsed.user_metadata || {
              name: 'Royal Patron',
              phone: '',
            },
          };
          setUser(mappedUser);
          setSession({ user: mappedUser as unknown as SupabaseUser, access_token: 'mock-token' } as unknown as Session);
        }
      } catch (err) {
        console.warn('Notice restoring local fallback session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }

    // Supabase Live Session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            const mappedUser: AppUser = {
              id: initialSession.user.id,
              uid: initialSession.user.id,
              email: initialSession.user.email || '',
              phone: initialSession.user.user_metadata?.phone || '',
              phoneNumber: initialSession.user.user_metadata?.phone || '',
              displayName: initialSession.user.user_metadata?.name || 'Royal Patron',
              role: (initialSession.user.user_metadata?.role as any) || 'customer',
              user_metadata: initialSession.user.user_metadata || {},
            };
            setUser(mappedUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.warn('Notice fetching initial Supabase session:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          const mappedUser: AppUser = {
            id: currentSession.user.id,
            uid: currentSession.user.id,
            email: currentSession.user.email || '',
            phone: currentSession.user.user_metadata?.phone || '',
            phoneNumber: currentSession.user.user_metadata?.phone || '',
            displayName: currentSession.user.user_metadata?.name || 'Royal Patron',
            role: (currentSession.user.user_metadata?.role as any) || 'customer',
            user_metadata: currentSession.user.user_metadata || {},
          };
          setUser(mappedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --------------------------------------------------------------------------
  // PHONE OTP (PRIMARY TARGET)
  // --------------------------------------------------------------------------
  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication service is not configured. Please supply Firebase credentials to activate live Phone OTP.');
    }
    return firebaseSendPhoneOtp(phoneNumber, appVerifier);
  };

  const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    code: string,
    metadata?: { name?: string; email?: string }
  ) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication service is not configured. Please supply Firebase credentials to activate live Phone OTP.');
    }
    const cred = await firebaseConfirmPhoneOtp(confirmationResult, code);
    if (cred.user) {
      const userProfile = await usersRepository.ensureProfile(
        cred.user.uid,
        cred.user.email || metadata?.email || null,
        cred.user.phoneNumber,
        metadata?.name || cred.user.displayName || undefined
      );
      setProfile(userProfile);
    }
    return cred;
  };

  // --------------------------------------------------------------------------
  // GOOGLE AUTH
  // --------------------------------------------------------------------------
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const cred = await firebaseSignInWithGoogle();
      if (cred.user) {
        const userProfile = await usersRepository.ensureProfile(
          cred.user.uid,
          cred.user.email,
          cred.user.phoneNumber,
          cred.user.displayName || undefined
        );
        setProfile(userProfile);
      }
      return cred;
    }

    if (isSupabaseConfigured) {
      return supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    }

    throw new Error('Google Sign-In is unavailable. Please verify Firebase Authentication configuration or use email and password.');
  };

  // --------------------------------------------------------------------------
  // EMAIL / PASSWORD ACTIONS (COMPATIBILITY)
  // --------------------------------------------------------------------------
  const signUp = async (email: string, password: string, options?: any) => {
    if (isFirebaseConfigured && auth) {
      const cred = await firebaseSignUpWithEmail(email, password, {
        displayName: options?.data?.name,
        phoneNumber: options?.data?.phone,
      });
      if (cred.user) {
        const userProfile = await usersRepository.ensureProfile(
          cred.user.uid,
          cred.user.email,
          options?.data?.phone || cred.user.phoneNumber,
          options?.data?.name || cred.user.displayName || undefined
        );
        setProfile(userProfile);
      }
      return cred;
    }

    // Fallback: Supabase
    if (!isSupabaseConfigured) {
      const mockUser: AppUser = {
        id: `patron_${Date.now()}`,
        uid: `patron_${Date.now()}`,
        email,
        phone: options?.data?.phone || '',
        phoneNumber: options?.data?.phone || '',
        displayName: options?.data?.name || email.split('@')[0],
        role: 'customer',
        user_metadata: {
          name: options?.data?.name || email.split('@')[0],
          phone: options?.data?.phone || '',
        },
      };
      setUser(mockUser);
      setSession({ user: mockUser as unknown as SupabaseUser, access_token: 'mock-jwt-token' } as unknown as Session);
      try {
        localStorage.setItem('musha_local_user', JSON.stringify(mockUser));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return { user: mockUser, session: { user: mockUser, access_token: 'mock' } };
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
    if (isFirebaseConfigured && auth) {
      const cred = await firebaseSignInWithEmail(email, password);
      if (cred.user) {
        const userProfile = await usersRepository.ensureProfile(
          cred.user.uid,
          cred.user.email,
          cred.user.phoneNumber,
          cred.user.displayName || undefined
        );
        setProfile(userProfile);
      }
      return cred;
    }

    // Fallback: Supabase
    if (!isSupabaseConfigured) {
      const mockUser: AppUser = {
        id: 'patron_vip_001',
        uid: 'patron_vip_001',
        email,
        phone: '',
        phoneNumber: '',
        displayName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'customer',
        user_metadata: {
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          phone: '',
        },
      };
      setUser(mockUser);
      setSession({ user: mockUser as unknown as SupabaseUser, access_token: 'mock-jwt-token' } as unknown as Session);
      try {
        localStorage.setItem('musha_local_user', JSON.stringify(mockUser));
      } catch (e) {
        console.warn('LocalStorage error saving demo user:', e);
      }
      return { user: mockUser, session: { user: mockUser, access_token: 'mock' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }

    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      try {
        localStorage.removeItem('musha_local_user');
      } catch (e) {
        console.warn('LocalStorage notice:', e);
      }
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    if (isFirebaseConfigured && auth) {
      await firebaseSendPasswordReset(email);
      return { data: {}, error: null };
    }

    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  };

  const refreshProfile = async () => {
    if (user?.uid && isFirebaseConfigured) {
      const refreshed = await usersRepository.getById(user.uid);
      if (refreshed) setProfile(refreshed);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isFirebaseActive: isFirebaseConfigured,
    signUp,
    login,
    logout,
    signOut: logout,
    resetPassword,
    sendPhoneOtp,
    confirmPhoneOtp,
    loginWithGoogle,
    refreshProfile,
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
