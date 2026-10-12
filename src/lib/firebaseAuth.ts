/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

/**
 * Dedicated Firebase Authentication service foundation.
 * Note: Operates in tandem with existing Supabase Auth during migration staging.
 */

export interface FirebaseAuthUserMetadata {
  displayName?: string;
  phoneNumber?: string;
}

/**
 * Subscribe to Firebase Auth state transitions.
 */
export function subscribeToFirebaseAuth(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Retrieve currently logged in Firebase User synchronously.
 */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  if (!isFirebaseConfigured || !auth) return null;
  return auth.currentUser;
}

/**
 * Sign in using email credentials.
 */
export async function firebaseSignInWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new account with email credentials and optional profile metadata.
 */
export async function firebaseSignUpWithEmail(
  email: string,
  password: string,
  metadata?: FirebaseAuthUserMetadata
) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (metadata?.displayName && credential.user) {
    await updateProfile(credential.user, {
      displayName: metadata.displayName,
    });
  }
  return credential;
}

/**
 * Sign out the current Firebase user.
 */
export async function firebaseSignOut() {
  if (!isFirebaseConfigured || !auth) return;
  return signOut(auth);
}

/**
 * Transmit password reset email to user.
 */
export async function firebaseSendPasswordReset(email: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  return sendPasswordResetEmail(auth, email);
}

/**
 * Google Sign-In popup authentication foundation.
 */
export async function firebaseSignInWithGoogle() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' && typeof window !== 'undefined') {
      console.error(
        `[FirebaseAuth] auth/unauthorized-domain: The current domain "${window.location.hostname}" is not authorized in Firebase Console.\n` +
        `To authorize: Open Firebase Console for project "musha-ae73e" > Build > Authentication > Settings > Authorized domains > Add domain "${window.location.hostname}".`
      );
    }
    throw error;
  }
}

/**
 * Initialize reCAPTCHA Verifier for phone number OTP authentication.
 */
export function createFirebaseRecaptchaVerifier(
  containerId: string,
  options?: { size?: 'invisible' | 'normal' }
): RecaptchaVerifier | null {
  if (!isFirebaseConfigured || !auth) return null;
  return new RecaptchaVerifier(auth, containerId, {
    size: options?.size || 'invisible',
  });
}

/**
 * Send SMS verification code to phone number.
 */
export async function firebaseSendPhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Confirm 6-digit phone verification OTP code.
 */
export async function firebaseConfirmPhoneOtp(
  confirmationResult: ConfirmationResult,
  verificationCode: string
) {
  return confirmationResult.confirm(verificationCode);
}

/**
 * Format Firebase Auth errors into clear, luxury, customer-friendly messages.
 */
export function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication issue occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/unauthorized-domain': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain unauthorized: "${currentHost}" is not on the Firebase Authorized Domains list. Please add this domain in Firebase Console under Authentication > Settings > Authorized domains.`;
    }
    case 'auth/popup-blocked':
      return 'Sign-in window was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one sign-in window can be open at a time.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase project "musha-ae73e". Please enable Google provider in Firebase Console > Authentication > Sign-in method.';
    case 'auth/invalid-phone-number':
      return 'Enter a valid phone number including country code.';
    case 'auth/missing-phone-number':
      return 'Enter a valid phone number.';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP. Please check the 6 digits and try again.';
    case 'auth/code-expired':
      return 'OTP expired. Please request a new code.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/quota-exceeded':
      return 'SMS service quota exceeded. Please try again shortly or contact concierge.';
    case 'auth/captcha-check-failed':
      return 'Security verification check failed. Please refresh and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please verify your details.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/popup-closed-by-user':
      return 'Authentication window was closed before completion.';
    default:
      if (error.message?.includes('not configured')) {
        return 'Authentication service is not configured.';
      }
      return error.message || 'Authentication could not be completed.';
  }
}

