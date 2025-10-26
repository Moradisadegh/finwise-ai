"use client";

import React, { useState } from 'react';
import { useSupabase } from '@/context/supabase-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";

export default function EmailAuth() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        // بررسی صحت ایمیل و رمز عبور
        if (!email || !password) {
          throw new Error('ایمیل و رمز عبور الزامی هستند');
        }
        
        if (password.length < 6) {
          throw new Error('رمز عبور باید حداقل 6 کاراکتر باشد');
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          alert('ثبت نام با موفقیت انجام شد. لطفا ایمیل خود را برای تأیید بررسی کنید.');
          router.push('/');
        }
      } else {
        // بررسی صحت ایمیل و رمز عبور
        if (!email || !password) {
          throw new Error('ایمیل و رمز عبور الزامی هستند');
        }
        
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
              <div className="flex items-center gap-2 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/')}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4 ml-1" />
                  بازگشت
                </Button>
              </div>
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
        </div>
      </main>
    </div>
  );
}
