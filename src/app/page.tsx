"use client";

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/context/supabase-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { TrendingUp, PieChart, Shield, Mail, Chrome } from "lucide-react";

export default function Home() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  // بررسی وضعیت کاربر
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
        
        if (user) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error getting user:', err);
      }
    };
    
    getUser();
    
    // گوش دادن به تغییرات احراز هویت
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        router.push('/dashboard');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback` 
            : 'http://localhost:3000/auth/callback'
        }
      });
      
      if (error) throw error;
      
      // هدایت به صفحه احراز هویت گوگل
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'خطایی در ورود با گوگل رخ داده است');
    }
  };

  const handleEmailSignIn = () => {
    router.push('/auth/email');
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>در حال هدایت به داشبورد...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col" dir="rtl">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FinWise AI</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>ورود به حساب کاربری</CardTitle>
              <CardDescription>
                با یکی از روش‌های زیر وارد شوید
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Chrome className="h-5 w-5" />
                  ورود با گوگل
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      یا
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleEmailSignIn}
                  className="w-full flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  ورود با ایمیل
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>دسته‌بندی هوشمند</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  تراکنش‌های خود را به‌صورت خودکار با الگوریتم‌های هوش مصنوعی دسته‌بندی کنید
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <PieChart className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>بینش‌های مالی</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  بینش‌های قابل اقدام برای بهبود عادت‌های مالی خود دریافت کنید
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>امن و خصوصی</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  داده‌های مالی شما رمزگذاری شده و هرگز با اشخاص ثالث به اشتراک گذاشته نمی‌شود
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} FinWise AI. تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
  );
}
