// src/app/dashboard/page.tsx
"use client";

import React from 'react';
import FinWiseAIDashboard from '@/components/dashboard/FinWiseAIDashboard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // If user is not logged in, redirect to login page
  if (!user) {
    router.push('/login');
    return null;
  }

  return <FinWiseAIDashboard />;
}
