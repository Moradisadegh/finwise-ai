"use client";

import React, { useState, useEffect } from "react";
import Header from "./header";
import SummaryCards from "./summary-cards";
import Charts from "./charts";
import TransactionsTable from "./transactions-table";
import CategoryManagement from "./category-management";
import FileUpload from "./file-upload";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Home, 
  List, 
  Settings 
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Types
interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "درآمد" | "هزینه";
  category: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// API Functions
const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        description,
        amount,
        type,
        category_id,
        categories (id, name, color)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(t => ({
      id: t.id,
      date: new Date(t.date),
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.categories?.name || 'دسته‌بندی نشده',
      category_id: t.category_id || ''
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

const fetchCategories = async (userId: string): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const updateTransactionCategory = async (transactionId: string, categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ category_id: categoryId })
      .eq('id', transactionId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

const addCategory = async (userId: string, name: string): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        { 
          user_id: userId, 
          name, 
          color: `#${Math.floor(Math.random()*16777215).toString(16)}` 
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

const uploadStatement = async (userId: string, file: File): Promise<void> => {
  try {
    // آپلود فایل به Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('statements')
      .upload(`${userId}/${fileName}`, file);
    
    if (uploadError) throw uploadError;
    
    // ذخیره اطلاعات فایل در دیتابیس
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert([
        {
          user_id: userId,
          filename: file.name,
          file_path: `${userId}/${fileName}`,
          file_size: file.size
        }
      ]);
    
    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export default function FinWiseAIDashboard() {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User>({ 
    id: "user_123", // در عمل از Supabase Auth بگیرید
    name: "کاربر FinWise", 
    email: "user@example.com" 
  });

  // بارگذاری اولیه داده‌ها
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedTransactions, fetchedCategories] = await Promise.all([
          fetchTransactions(user.id),
          fetchCategories(user.id)
        ]);
        
        setTransactions(fetchedTransactions);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  // محاسبه جمع درآمدها و هزینه‌ها
  useEffect(() => {
    const income = transactions
      .filter(t => t.type === "درآمد")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === "هزینه")
      .reduce((sum, t) => sum + t.amount, 0);
    
    setTotalIncome(income);
    setTotalExpenses(expenses);
  }, [transactions]);

  // مدیریت آپلود فایل
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploading(true);
      
      try {
        await uploadStatement(user.id, selectedFile);
        // بارگذاری مجدد داده‌ها پس از آپلود
        const updatedTransactions = await fetchTransactions(user.id);
        setTransactions(updatedTransactions);
        alert("فایل با موفقیت پردازش شد!");
      } catch (error) {
        alert("خطا در پردازش فایل");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // تغییر دسته‌بندی تراکنش
  const handleCategoryChange = async (transactionId: string, categoryId: string) => {
    try {
      await updateTransactionCategory(transactionId, categoryId);
      // بروزرسانی UI
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { 
                ...t, 
                category_id: categoryId,
                category: categories.find(c => c.id === categoryId)?.name || t.category 
              } 
            : t
        )
      );
    } catch (error) {
      alert("خطا در به‌روزرسانی دسته‌بندی");
    }
  };

  // افزودن دسته‌بندی جدید
  const handleAddCategory = async (name: string) => {
    try {
      const newCategory = await addCategory(user.id, name);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      alert("خطا در افزودن دسته‌بندی");
    }
  };

  // حذف دسته‌بندی
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      // بازنشانی تراکنش‌های این دسته به "دسته‌بندی نشده"
      setTransactions(prev => 
        prev.map(t => 
          t.category_id === categoryId 
            ? { ...t, category_id: "", category: "دسته‌بندی نشده" } 
            : t
        )
      );
    } catch (error) {
      alert("خطا در حذف دسته‌بندی");
    }
  };

  // منوی ناوبری
  const renderNavigation = () => (
    <nav className="flex flex-col space-y-2">
      <Button
        variant={currentPage === "dashboard" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => setCurrentPage("dashboard")}
      >
        <Home className="ml-2 h-4 w-4" />
        داشبورد
      </Button>
      <Button
        variant={currentPage === "transactions" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => setCurrentPage("transactions")}
      >
        <List className="ml-2 h-4 w-4" />
        تراکنش‌ها
      </Button>
      <Button
        variant={currentPage === "categories" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => setCurrentPage("categories")}
      >
        <Settings className="ml-2 h-4 w-4" />
        دسته‌بندی‌ها
      </Button>
    </nav>
  );

  // صفحه داشبورد
  const renderDashboard = () => (
    <div>
      <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
      <SummaryCards 
        totalIncome={totalIncome} 
        totalExpenses={totalExpenses} 
        netSavings={totalIncome - totalExpenses} 
      />
      <Charts categories={categories} transactions={transactions} />
    </div>
  );

  // صفحه تراکنش‌ها
  const renderTransactions = () => (
    <TransactionsTable 
      transactions={transactions} 
      categories={categories} 
      onCategoryChange={handleCategoryChange} 
    />
  );

  // صفحه دسته‌بندی‌ها
  const renderCategories = () => (
    <CategoryManagement 
      categories={categories} 
      onAddCategory={handleAddCategory} 
      onDeleteCategory={handleDeleteCategory} 
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <p className="text-lg">در حال بارگذاری داده‌ها...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header 
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mb-6">
              {renderNavigation()}
            </div>
          )}
          
          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              {renderNavigation()}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {currentPage === "dashboard" && renderDashboard()}
            {currentPage === "transactions" && renderTransactions()}
            {currentPage === "categories" && renderCategories()}
          </div>
        </div>
      </div>
    </div>
  );
}
