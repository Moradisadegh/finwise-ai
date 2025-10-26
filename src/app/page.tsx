"use client";

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/context/supabase-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { TrendingUp, PieChart, Shield } from "lucide-react";

export default function Home() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  // بررسی وضعیت کاربر
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        router.push('/dashboard');
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          alert('ثبت نام با موفقیت انجام شد. لطفا ایمیل خود را برای تأیید بررسی کنید.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'خطایی در احراز هویت رخ داده است');
    } finally {
      setLoading(false);
    }
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
              <CardTitle>{isSignUp ? 'ثبت نام' : 'ورود'}</CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'حساب کاربری خود را ایجاد کنید' 
                  : 'وارد حساب کاربری خود شوید'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="ایمیل"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="رمز عبور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'در حال پردازش...' : (isSignUp ? 'ثبت نام' : 'ورود')}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="p-0 h-auto"
                >
                  {isSignUp 
                    ? 'حساب کاربری دارید؟ ورود' 
                    : 'حساب کاربری ندارید؟ ثبت نام'}
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
