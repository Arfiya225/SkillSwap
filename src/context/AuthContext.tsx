"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { DbUser } from "../types/user";

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: DbUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  googleLogin: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  refreshDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = async (uid: string) => {
    try {
      const userRef = doc(db, "Users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setDbUser(userSnap.data() as DbUser);
      } else {
        setDbUser(null);
      }
    } catch (error) {
      console.error("Error fetching dbUser:", error);
      setDbUser(null);
    }
  };

  const refreshDbUser = async () => {
    if (user) {
      await fetchDbUser(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchDbUser(currentUser.uid);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await fetchDbUser(credential.user.uid);
      return credential;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Initialize Firestore document
      const userRef = doc(db, "Users", credential.user.uid);
      const newDbUser: DbUser = {
        uid: credential.user.uid,
        name: name,
        email: email,
        avatar: "",
        bio: "",
        college: "",
        degree: "",
        skillsCanTeach: [],
        skillsWantToLearn: [],
        github: "",
        linkedin: "",
        portfolio: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, newDbUser);
      setDbUser(newDbUser);
      
      // Send verification email
      await sendEmailVerification(credential.user);
      
      return credential;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const currentUser = credential.user;
      
      // Check if user already exists in Firestore
      const userRef = doc(db, "Users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Initialize new user document for Google Sign-in
        const newDbUser: DbUser = {
          uid: currentUser.uid,
          name: currentUser.displayName || "Google User",
          email: currentUser.email || "",
          avatar: currentUser.photoURL || "",
          bio: "",
          college: "",
          degree: "",
          skillsCanTeach: [],
          skillsWantToLearn: [],
          github: "",
          linkedin: "",
          portfolio: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newDbUser);
        setDbUser(newDbUser);
      } else {
        setDbUser(userSnap.data() as DbUser);
      }
      return credential;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setDbUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        loading,
        login,
        signup,
        googleLogin,
        logout,
        resetPassword,
        sendVerification,
        refreshDbUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
