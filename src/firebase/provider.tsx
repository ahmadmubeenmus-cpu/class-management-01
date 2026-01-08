'use client';
import React, { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Define the shape of the context
interface FirebaseContextValue {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth | null; // Auth is now optional
}

// Create the context with an initial undefined value
const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

// Define the props for the provider component
interface FirebaseProviderProps {
  children: React.ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
  auth?: Auth; // Auth is optional
}

/**
 * Provides the Firebase app, Firestore, and optionally Auth instances to its children.
 * Also includes the global Firebase error listener.
 */
export function FirebaseProvider({ children, app, firestore, auth }: FirebaseProviderProps) {
  const contextValue: FirebaseContextValue = {
    app,
    firestore,
    auth: auth || null,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * Custom hook to access the full Firebase context.
 * Throws an error if used outside of a FirebaseProvider.
 * @returns {FirebaseContextValue} The Firebase context value.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * Custom hook to access the Firebase App instance.
 * @returns {FirebaseApp} The Firebase App instance.
 */
export function useFirebaseApp() {
  const { app } = useFirebase();
  return app;
}

/**
 * Custom hook to access the Firestore instance.
 * @returns {Firestore} The Firestore instance.
 */
export function useFirestore() {
  const { firestore } = useFirebase();
  return firestore;
}

/**
 * Custom hook to access the Firebase Auth instance.
 * @returns {Auth | null} The Firebase Auth instance, or null if not provided.
 */
export function useAuth() {
  const { auth } = useFirebase();
  return auth;
}
