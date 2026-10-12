/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const getEnv = (val: string | undefined, fallback: string): string => {
  return val && val.trim() !== '' ? val.trim() : fallback;
};

/**
 * Firebase Client Configuration derived from Vite environment variables.
 */
export const firebaseConfig = {
  apiKey: getEnv(import.meta.env.VITE_FIREBASE_API_KEY, 'AIzaSyBUpyUgSTEWDv2mSAs5DpQzcuR637puNy4'),
  authDomain: getEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 'musha-ae73e.firebaseapp.com'),
  projectId: getEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'musha-ae73e'),
  storageBucket: getEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, 'musha-ae73e.firebasestorage.app'),
  messagingSenderId: getEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, '20865941571'),
  appId: getEnv(import.meta.env.VITE_FIREBASE_APP_ID, '1:20865941571:web:3905df1170e2169c7a14f6'),
};

/**
 * Safe check to verify whether Firebase environment variables are actively provisioned.
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  !firebaseConfig.apiKey.includes('MY_FIREBASE') &&
  !firebaseConfig.projectId.includes('placeholder')
);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    firestoreInstance = getFirestore(appInstance);
  } catch (error) {
    console.warn('Musha Empire: Firebase client initialization error:', error);
  }
} else {
  // Graceful development notice without halting compilation or UI execution
  if (import.meta.env.DEV) {
    console.info(
      'Musha Empire: Firebase foundation initialized in unconfigured standby mode. (Provide VITE_FIREBASE_* credentials to activate live Firebase).'
    );
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = firestoreInstance;
