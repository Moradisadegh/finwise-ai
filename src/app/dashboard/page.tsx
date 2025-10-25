// src/app/dashboard/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import FinWiseAIDashboard from "@/components/dashboard/FinWiseAIDashboard";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  return <FinWiseAIDashboard onLogout={logout} />;
}
