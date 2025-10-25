// src/components/dashboard/FinWiseAIDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { categoryService, Category } from "@/lib/categoryService";
import { transactionService, TransactionWithCategory } from "@/lib/transactionService";
import { fileService, UploadedFile } from "@/lib/fileService";

interface FinWiseAIDashboardProps {
  onLogout?: () => void;
}

export default function FinWiseAIDashboard({ onLogout }: FinWiseAIDashboardProps) {
  const { user, userProfile } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [categorySpendingData, setCategorySpendingData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [monthlyCashFlowData, setMonthlyCashFlowData] = useState<{ month: string; income: number; expenses: number }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // بارگذاری داده‌ها
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    // بارگذاری دسته‌بندی‌ها
    const userCategories = await categoryService.getUserCategories(user.id);
    setCategories(userCategories);
    
    // بارگذاری تراکنش‌ها
    const userTransactions = await transactionService.getUserTransactions(user.id);
    setTransactions(userTransactions);
    
    // بارگذاری خلاصه مالی
    const summary = await transactionService.getUserFinancialSummary(user.id);
    setTotalIncome(summary.totalIncome);
    setTotalExpenses(summary.totalExpenses);
    setNetSavings(summary.netSavings);
    
    // بارگذاری داده‌های نمودارها
    const categoryData = await transactionService.getCategorySpendingData(user.id);
    setCategorySpendingData(categoryData);
    
    const cashFlowData = await transactionService.getMonthlyCashFlowData(user.id);
    setMonthlyCashFlowData(cashFlowData);
    
    // بارگذاری فایل‌های آپلود شده
    const files = await fileService.getUserFiles(user.id);
    setUploadedFiles(files);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsUploading(true);
    
    try {
      // آپلود فایل به Supabase
      const uploadedFile = await fileService.uploadFile(selectedFile, user.id);
      
      if (uploadedFile) {
        // بروزرسانی لیست فایل‌ها
        setUploadedFiles(prev => [uploadedFile, ...prev]);
        alert("فایل با موفقیت آپلود شد!");
        
        // در اینجا می‌توانید منطق پردازش فایل را اضافه کنید
        // مثلاً پارس کردن فایل اکسل یا PDF و ایجاد تراکنش‌ها
      } else {
        alert("خطا در آپلود فایل");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
      setFile(null);
      if (e.target) e.target.value = ""; // ریست کردن input
    }
  };

  // Handle category change for transaction
  const handleCategoryChange = async (transactionId: string, categoryId: string) => {
    const success = await transactionService.updateTransaction(transactionId, {
      category_id: categoryId
    });
    
    if (success) {
      // بروزرسانی تراکنش در state
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { 
                ...t, 
                category_id: categoryId,
                category: categories.find(c => c.id === categoryId) || undefined
              } 
            : t
        )
      );
      
      // بروزرسانی داده‌های نمودار
      loadData();
    } else {
      alert("خطا در بروزرسانی دسته‌بندی");
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;
    
    const newCategory = await categoryService.createCategory({
      user_id: user.id,
      name: newCategoryName.trim(),
      color: newCategoryColor
    });
    
    if (newCategory) {
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");
      setNewCategoryColor("#3B82F6");
      setIsAddingCategory(false);
    } else {
      alert("خطا در ایجاد دسته‌بندی");
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    const success = await categoryService.deleteCategory(categoryId);
    
    if (success) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      // بروزرسانی تراکنش‌هایی که این دسته‌بندی را داشتند
      setTransactions(prev => 
        prev.map(t => 
          t.category_id === categoryId 
            ? { ...t, category_id: null, category: undefined } 
            : t
        )
      );
    } else {
      alert("خطا در حذف دسته‌بندی");
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    const success = await fileService.deleteFile(fileId, filePath);
    
    if (success) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } else {
      alert("خطا در حذف فایل");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FinWise AI Dashboard</h1>
            <p className="text-gray-600">
              {userProfile ? `خوش آمدید، ${userProfile.full_name}` : "در حال بارگذاری..."}
            </p>
          </div>
          {onLogout && (
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          )}
        </header>

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              آپلود صورت‌حساب بانکی
            </CardTitle>
            <CardDescription>
              فایل اکسل یا PDF صورت‌حساب بانکی خود را آپلود کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  type="file" 
                  accept=".xlsx,.xls,.pdf" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="mt-2 text-sm text-gray-500">در حال پردازش فایل...</p>
                )}
              </div>
              <Button disabled={isUploading || !file}>
                {isUploading ? "در حال آپلود..." : "آپلود"}
              </Button>
            </div>
            
            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">فایل‌های آپلود شده</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{file.file_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(file.uploaded_at).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(fileService.getFileUrl(file.file_path) || '#', '_blank')}
                        >
                          دانلود
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">درآمد کل</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+12% از ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هزینه‌های کل</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+5% از ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پس‌انداز خالص</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${netSavings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+18% از ماه گذشته</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>هزینه‌ها بر اساس دسته‌بندی</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySpendingData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || "#8884d8"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, "مبلغ"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>جریان نقدی ماهانه</CardTitle
