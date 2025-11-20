
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthUserChanged, getUserDocument } from '../firebase/authService';
import { type User } from 'firebase/auth.js';
import { onSnapshot, doc } from 'firebase/firestore.js';
import { db } from '../firebase/config';

interface UserData {
  credits: number;
  email: string;
  totalSpent: number;
  // Diğer kullanıcı verileri buraya eklenebilir
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthUserChanged(async (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribeFirestore = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        }
        setLoading(false);
      });
    }
    
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user]);

  const value = { user, userData, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
