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
  isAdmin: boolean;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    userProfile: null,
    isLoading: true,
    isAdmin: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuth();
    const firestore = useFirestore();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    // Check for admin profile first
    const adminProfileRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'admins', user.uid);
    }, [firestore, user?.uid]);
    
    const { data: adminProfile } = useDoc<UserProfile>(adminProfileRef);

    // If not an admin, check for a regular user profile
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid || adminProfile) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid, adminProfile]);

    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const finalUserProfile = adminProfile ?? userProfile ?? null;
    const isAdmin = !!adminProfile;

    const value = {
        user,
        userProfile: finalUserProfile,
        isLoading: isLoading,
        isAdmin: isAdmin
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
