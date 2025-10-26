// src/context/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, AuthState } from '@/lib/authService';
import { userService, UserProfile } from '@/lib/supabase/userService';

interface AuthContextType {
  user: AuthState['user'];
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    const { user: currentUser, isAuthenticated: authStatus } = await authService.getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(authStatus);
      await fetchUserProfile(currentUser.id);
    }
    
    setIsLoading(false);
  };

  const fetchUserProfile = async (userId: string) => {
    const profile = await userService.getUserProfile(userId);
    setUserProfile(profile);
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      await fetchUserProfile(result.user.id);
    }
    return result;
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await authService.signup(email, password, name);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      await fetchUserProfile(result.user.id);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const value = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
