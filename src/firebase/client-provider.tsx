'use client';
import React, { useState, useEffect } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebaseInstance, setFirebaseInstance] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const { firebaseApp, firestore, auth } = initializeFirebase(firebaseConfig);
    setFirebaseInstance({ app: firebaseApp, firestore, auth });
  }, []);

  if (!firebaseInstance) {
    // You can render a loading indicator here
    return <div className="flex h-screen w-full items-center justify-center">Loading Firebase...</div>;
  }

  return (
    <FirebaseProvider app={firebaseInstance.app} firestore={firebaseInstance.firestore} auth={firebaseInstance.auth}>
      {children}
    </FirebaseProvider>
  );
}
