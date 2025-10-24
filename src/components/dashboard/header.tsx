"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  User, 
  LogOut, 
  Menu, 
  X as CloseIcon 
} from "lucide-react";

interface User {
  name: string;
  email: string;
}

interface HeaderProps {
  user: User;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({
  user,
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen
}: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">FinWise AI</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4 ml-2" />
            خروج
          </Button>
        </div>
      </div>
    </header>
  );
}
