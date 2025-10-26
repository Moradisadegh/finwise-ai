"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      login();
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FinWise AI</h1>
          {isAuthenticated ? (
            <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
          ) : (
            <Button onClick={handleGetStarted}>Get Started</Button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            AI-Powered Personal Finance
          </h1>
          <p className="mt-6 text-xl text-gray-500">
            Take control of your finances with intelligent insights and automated categorization
          </p>
          
          <div className="mt-10">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Smart Categorization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically categorize your transactions with AI-powered algorithms
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get actionable insights to improve your spending habits
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your financial data is encrypted and never shared with third parties
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} FinWise AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
