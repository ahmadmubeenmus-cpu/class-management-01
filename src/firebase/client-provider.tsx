'use client';
import React, { useState, useEffect } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebaseInstance, setFirebaseInstance] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    const { firebaseApp, firestore } = initializeFirebase(firebaseConfig);
    setFirebaseInstance({ app: firebaseApp, firestore });
  }, []);

  if (!firebaseInstance) {
    // You can render a loading indicator here
    return <div>Loading Firebase...</div>;
  }

  return (
    <FirebaseProvider app={firebaseInstance.app} firestore={firebaseInstance.firestore}>
      {children}
    </FirebaseProvider>
  );
}
