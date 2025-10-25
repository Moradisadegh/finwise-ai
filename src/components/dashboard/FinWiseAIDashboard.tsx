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
import { Upload, Plus, Edit, Trash2, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

// Types
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "درآمد" | "هزینه";
  category_id: number;
  category_name?: string;
  category_color?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

export default function FinWiseAIDashboard() {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user and data on component mount
  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchData(user.id);
      }
    };

    fetchUserAndData();
  }, []);

  // Fetch data from database
  const fetchData = async (userId: string) => {
    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
    
    if (!categoriesError && categoriesData) {
      setCategories(categoriesData);
    }

    // Fetch transactions with category info
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (name, color)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);
    
    if (!transactionsError && transactionsData) {
      const formattedTransactions = transactionsData.map(t => ({
        ...t,
        category_name: t.categories?.name,
        category_color: t.categories?.color
      }));
      setTransactions(formattedTransactions);
    }
  };

  // Calculate totals
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

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userId) {
      setFile(e.target.files[0]);
      setIsUploading(true);
      
      // In a real app, you would parse the file and insert transactions
      // For now, we'll just simulate
      setTimeout(() => {
        setIsUploading(false);
        alert("فایل با موفقیت پردازش شد!");
      }, 1500);
    }
  };

  // Handle category change for transaction
  const handleCategoryChange = async (transactionId: number, categoryId: number) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('transactions')
      .update({ category_id: categoryId })
      .eq('id', transactionId)
      .eq('user_id', userId);
    
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
    if (newCategoryName.trim() && userId) {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          { 
            name: newCategoryName.trim(),
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            user_id: userId
          }
        ])
        .select();
      
      if (!error && data) {
        setCategories([...categories, data[0]]);
        setNewCategoryName("");
        setIsAddingCategory(false);
      }
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);
    
    if (!error) {
      setCategories(categories.filter(c => c.id !== categoryId));
      // Reset transactions with this category
      setTransactions(prev => 
        prev.map(t => 
          t.category_id === categoryId 
            ? { ...t, category_id: 0 } 
            : t
        )
      );
    }
  };

  // Format currency for Persian
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  // Prepare data for charts
  const categorySpendingData = categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.category_id === category.id && t.type === "هزینه"
    );
    
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: total
    };
  }).filter(item => item.value > 0);

  // Mock monthly data - in a real app, this would come from the database
  const monthlyCashFlowData = [
    { month: "فروردین", income: 40000000, expenses: 28000000 },
    { month: "اردیبهشت", income: 42000000, expenses: 31000000 },
    { month: "خرداد", income: 38000000, expenses: 29000000 },
    { month: "تیر", income: 41000000, expenses: 32000000 },
    { month: "مرداد", income: 43000000, expenses: 35000000 },
  ];

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ورود به FinWise AI</CardTitle>
            <CardDescription>
              برای استفاده از داشبورد مالی، وارد حساب کاربری خود شوید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
            })}>
              ورود با گوگل
            </Button>
            <Button className="w-full" variant="outline" onClick={() => supabase.auth.signInWithOAuth({
              provider: 'github',
            })}>
              ورود با گیت‌هاب
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">داشبورد FinWise AI</h1>
            <p className="text-gray-600">مدیریت هوشمند مالی شخصی</p>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            خروج
          </Button>
        </header>

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              بارگذاری صورتحساب بانکی
            </CardTitle>
            <CardDescription>
              فایل اکسل یا PDF صورتحساب بانکی خود را بارگذاری کنید
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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">+12% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هزینه‌های کل</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">+5% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پس‌انداز خالص</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalIncome - totalExpenses)}</div>
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
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "مبلغ"]} />
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
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "مبلغ"]} />
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
                دسته‌بندی تراکنش‌های مالی خود را انجام دهید
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
                      <TableCell className={transaction.type === "درآمد" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "درآمد" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={transaction.category_id?.toString() || ""}
                          onValueChange={(value) => handleCategoryChange(transaction.id, parseInt(value))}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="انتخاب دسته‌بندی" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
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
                مدیریت دسته‌بندی‌های هزینه‌های شما
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">دسته‌بندی‌های شما</h3>
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
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
                        className="w-4 h-4 rounded-full mr-3" 
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
