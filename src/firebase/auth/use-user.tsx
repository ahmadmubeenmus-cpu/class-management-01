'use client';
import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';


export interface UserContextValue {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    userProfile: null,
    isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuth();
    const firestore = useFirestore();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setIsLoading(false); // If no auth provider, stop loading
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'admins', user.uid);
    }, [firestore, user?.uid]);
    
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const value = {
        user,
        userProfile: userProfile ?? null,
        isLoading: isLoading
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
