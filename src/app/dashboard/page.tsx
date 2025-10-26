"use client";

import React, { useState, useEffect } from "react";
import { useSupabase } from '@/context/supabase-context';
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
import { Upload, Plus, Edit, Trash2, TrendingUp, Calendar, LogOut } from "lucide-react";

// Types
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // به ریال
  type: "income" | "expense";
  category_id: string | null;
  category?: Category;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

// تابع برای فرمت کردن اعداد به فرمت ریال
const formatRial = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
};

export default function DashboardPage() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // دریافت اطلاعات کاربر
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchCategories(user.id);
        fetchTransactions(user.id);
      }
    };
    
    getUser();
  }, [supabase]);

  // دریافت دسته‌بندی‌ها
  const fetchCategories = async (userId: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
    
    if (!error && data) {
      setCategories(data);
    }
  };

  // دریافت تراکنش‌ها
  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, color)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (!error && data) {
      setTransactions(data);
    }
  };

  // Calculate totals
  useEffect(() => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    setTotalIncome(income);
    setTotalExpenses(expenses);
  }, [transactions]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsUploading(true);
      
      // Simulate file processing
      setTimeout(() => {
        setIsUploading(false);
        alert("فایل با موفقیت پردازش شد!");
      }, 1500);
    }
  };

  // Handle category change for transaction
  const handleCategoryChange = async (transactionId: string, categoryId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('transactions')
      .update({ category_id: categoryId })
      .eq('id', transactionId)
      .eq('user_id', user.id);
    
    if (!error) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, category_id: categoryId } 
            : t
        )
      );
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;
    
    const newCategory = {
      name: newCategoryName.trim(),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert(newCategory)
      .select()
      .single();
    
    if (!error && data) {
      setCategories([...categories, data]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.id);
    
    if (!error) {
      setCategories(categories.filter(c => c.id !== categoryId));
      
      // Reset transactions with this category
      setTransactions(prev => 
        prev.map(t => 
          t.category_id === categoryId 
            ? { ...t, category_id: null } 
            : t
        )
      );
    }
  };

  // داده‌های نمودارها
  const categorySpendingData = categories
    .filter(category => 
      transactions.some(t => t.category_id === category.id && t.type === "expense")
    )
    .map(category => {
      const total = transactions
        .filter(t => t.category_id === category.id && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: category.name,
        value: total
      };
    });

  const monthlyCashFlowData = [
    { month: "فروردین", income: 35000000, expenses: 25000000 },
    { month: "اردیبهشت", income: 38000000, expenses: 28000000 },
    { month: "خرداد", income: 40000000, expenses: 30000000 },
    { month: "تیر", income: 42000000, expenses: 32000000 },
    { month: "مرداد", income: 45000000, expenses: 35000000 },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">داشبورد FinWise AI</h1>
          <p className="text-gray-600">مدیریت هوشمند مالی شخصی</p>
        </header>

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              بارگذاری صورت‌حساب بانکی
            </CardTitle>
            <CardDescription>
              فایل اکسل یا PDF صورت‌حساب بانکی خود را بارگذاری کنید
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
              <Button disabled={isUploading}>
                {isUploading ? "در حال پردازش..." : "بارگذاری"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">درآمد کل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatRial(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">+12% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هزینه‌های کل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatRial(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">+5% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پس‌انداز خالص</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatRial(totalIncome - totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">+18% نسبت به ماه گذشته</p>
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
                        fill={categories.find(c => c.name === entry.name)?.color || "#8884d8"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatRial(Number(value)), "مبلغ"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>جریان نقدی ماهانه</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyCashFlowData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatRial(value).replace(' ریال', '')} />
                  <Tooltip formatter={(value) => [formatRial(Number(value)), "مبلغ"]} />
                  <Legend />
                  <Bar dataKey="income" fill="#06D6A0" name="درآمد" />
                  <Bar dataKey="expenses" fill="#FF6B6B" name="هزینه‌ها" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transactions and Categories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>تراکنش‌های اخیر</CardTitle>
              <CardDescription>
                دسته‌بندی تراکنش‌های مالی خود را مدیریت کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>شرح</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>دسته‌بندی</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString('fa-IR')}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "income" ? "+" : "-"}{formatRial(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={transaction.category_id || ""}
                          onValueChange={(value) => handleCategoryChange(transaction.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="انتخاب دسته‌بندی" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Category Management */}
          <Card>
            <CardHeader>
              <CardTitle>دسته‌بندی هزینه‌ها</CardTitle>
              <CardDescription>
                دسته‌بندی‌های هزینه‌های خود را مدیریت کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">دسته‌بندی‌های شما</h3>
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 ml-2" />
                      افزودن دسته‌بندی
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>افزودن دسته‌بندی جدید</DialogTitle>
                      <DialogDescription>
                        یک دسته‌بندی جدید برای تراکنش‌های خود ایجاد کنید
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="نام دسته‌بندی"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                        انصراف
                      </Button>
                      <Button onClick={handleAddCategory}>افزودن دسته‌بندی</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-3">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full ml-3" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
