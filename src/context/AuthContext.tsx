// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, AuthState } from "@/lib/authService";
import { User } from "@supabase/supabase-js";
import { userService, UserProfile } from "@/lib/userService";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // بارگذاری وضعیت احراز هویت و پروفایل کاربر
  useEffect(() => {
    const loadUser = async () => {
      const state = await authService.getCurrentUser();
      setAuthState(state);
      
      if (state.user) {
        // دریافت پروفایل کاربر
        const profile = await userService.getUserProfile(state.user.id);
        setUserProfile(profile);
      }
      
      setIsLoading(false);
    };

    loadUser();

    // گوش دادن به تغییرات وضعیت احراز هویت
    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user || null,
          isAuthenticated: !!session?.user
        });
        
        if (session?.user) {
          // دریافت پروفایل کاربر
          const profile = await userService.getUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setAuthState({
        user: result.user || null,
        isAuthenticated: !!result.user
      });
      
      if (result.user) {
        const profile = await userService.getUserProfile(result.user.id);
        setUserProfile(profile);
      }
    }
    return { success: result.success, message: result.message };
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await authService.signup(email, password, name);
    if (result.success) {
      setAuthState({
        user: result.user || null,
        isAuthenticated: !!result.user
      });
      
      if (result.user) {
        const profile = await userService.getUserProfile(result.user.id);
        setUserProfile(profile);
      }
    }
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    setUserProfile(null);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) return false;
    
    const success = await userService.updateUserProfile(authState.user.id, updates);
    if (success) {
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        userProfile,
        isAuthenticated: authState.isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
