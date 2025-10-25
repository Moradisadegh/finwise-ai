// src/components/auth/AuthForm.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          router.push("/dashboard");
        } else {
          setError(result.message);
        }
      } else {
        if (!name.trim()) {
          setError("لطفاً نام خود را وارد کنید");
          setIsLoading(false);
          return;
        }
        
        const result = await signup(email, password, name);
        if (result.success) {
          router.push("/dashboard");
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("خطایی رخ داده است");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isLogin ? "ورود به FinWise AI" : "ثبت نام در FinWise AI"}
        </CardTitle>
        <CardDescription>
          {isLogin 
            ? "حساب خود را وارد کنید" 
            : "حساب جدید بسازید"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">نام</div>
              <Input
                type="text"
                placeholder="نام خود را وارد کنید"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">ایمیل</div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">رمز عبور</div>
            <Input
              type="password"
              placeholder="حداقل 6 کاراکتر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>در حال پردازش...</span>
            ) : isLogin ? (
              "ورود"
            ) : (
              "ثبت نام"
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin 
              ? "حساب کاربری ندارید؟ ثبت نام کنید" 
              : "قبلاً ثبت نام کرده‌اید؟ ورود"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
