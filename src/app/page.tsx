"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FinWiseAIDashboard from "@/components/dashboard/FinWiseAIDashboard";
import AuthForm from "@/components/auth/AuthForm";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // بررسی وضعیت احراز هویت
    const token = localStorage.getItem("finwise_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email: string) => {
    // در یک سیستم واقعی اینجا باید API call انجام شود
    localStorage.setItem("finwise_token", email);
    localStorage.setItem("finwise_user", JSON.stringify({ email }));
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("finwise_token");
    localStorage.removeItem("finwise_user");
    setIsAuthenticated(false);
    router.push("/");
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <FinWiseAIDashboard onLogout={handleLogout} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <AuthForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
}
