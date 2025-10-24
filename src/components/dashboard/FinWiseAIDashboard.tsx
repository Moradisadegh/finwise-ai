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
import { Upload, Plus, Edit, Trash2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  type: "درآمد" | "هزینه";
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export default function FinWiseAIDashboard() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser?.email) {
        // Get user profile from our users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single();
        
        if (!error && data) {
          setUser(data);
          fetchData(data.id);
        } else {
          // Create user if not exists
          const fullName = authUser.user_metadata?.full_name || 
                          authUser.email.split('@')[0] || 
                          'کاربر';
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
              { 
                name: fullName,
                email: authUser.email,
                password_hash: '' // We don't store password in our table
              }
            ])
            .select()
            .single();
          
          if (!insertError && newUser) {
            setUser(newUser);
            fetchData(newUser.id);
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const fetchData = async (userId: string) => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Fetch transactions with category names
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Transform data to include category names
      const transformedTransactions = transactionsData?.map(t => ({
        ...t,
        category_name: t.categories?.name || 'دسته‌بندی نشده'
      })) || [];
      
      setTransactions(transformedTransactions);
      
      // Calculate totals
      const income = transformedTransactions
        .filter(t => t.type === "درآمد")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transformedTransactions
        .filter(t => t.type === "هزینه")
        .reduce((sum, t) => sum + t.amount, 0);
      
      setTotalIncome(income);
      setTotalExpenses(expenses);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('خطا در دریافت اطلاعات');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      setFile(file);
      setIsUploading(true);
      
      try {
        // Upload file to Supabase Storage (if you have storage set up)
        // For now, we'll just simulate the process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save file record to database
        const { error } = await supabase
          .from('uploaded_files')
          .insert([
            {
              user_id: user.id,
              filename: file.name,
              file_path: `uploads/${user.id}/${file.name}`,
              file_size: file.size
            }
          ]);
        
        if (error) throw error;
        
        alert("فایل با موفقیت آپلود شد!");
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('خطا در آپلود فایل');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle category change for transaction
  const handleCategoryChange = async (transactionId: string, categoryId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ category_id: categoryId })
        .eq('id', transactionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      const selectedCategory = categories.find(c => c.id === categoryId);
      if (selectedCategory) {
        setTransactions(prev => 
          prev.map(t => 
            t.id === transactionId 
              ? { ...t, category_id: categoryId, category_name: selectedCategory.name } 
              : t
          )
        );
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('خطا در به‌روزرسانی دسته‌بندی');
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          user_id: user.id,
          name: newCategoryName.trim(),
          color: `#${Math.floor(Math.random()*16777215).toString(16)}` 
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setCategories(prev => [...prev, data[0]]);
        setNewCategoryName("");
        setIsAddingCategory(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('خطا در افزودن دسته‌بندی');
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      
      // Reset transactions with this category
      setTransactions(prev => 
        prev.map(t => 
          t.category_id === categoryId 
            ? { ...t, category_id: null, category_name: 'دسته‌بندی نشده' } 
            : t
        )
      );
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('خطا در حذف دسته‌بندی');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>برای استفاده از داشبورد باید وارد شوید.</p>
      </div>
    );
  }

  // Prepare data for charts
  const categorySpendingData = categories.map(category => ({
    name: category.name,
    value: transactions
      .filter(t => t.category_id === category.id && t.type === 'هزینه')
      .reduce((sum, t) => sum + t.amount, 0)
  })).filter(c => c.value > 0);

  const monthlyCashFlowData = [
    { month: "فروردین", income: 4000000, expenses: 2800000 },
    { month: "اردیبهشت", income: 4200000, expenses: 3100000 },
    { month: "خرداد", income: 3800000, expenses: 2900000 },
    { month: "تیر", income: 4100000, expenses: 3200000 },
    { month: "مرداد", income: 4300000, expenses: 3500000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">داشبورد FinWise AI</h1>
          <p className="text-gray-600">خوش آمدید، {user.name}</p>
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
              <div className="text-2xl font-bold">﷼{totalIncome.toLocaleString('fa-IR')}</div>
              <p className="text-xs text-muted-foreground">+12% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هزینه‌های کل</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">﷼{totalExpenses.toLocaleString('fa-IR')}</div>
              <p className="text-xs text-muted-foreground">+5% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پس‌انداز خالص</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">﷼{(totalIncome - totalExpenses).toLocaleString('fa-IR')}</div>
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
                    {categories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || "#8884d8"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`﷼${Number(value).toLocaleString('fa-IR')}`, "مبلغ"]} />
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
                  <Tooltip formatter={(value) => [`﷼${Number(value).toLocaleString('fa-IR')}`, "مبلغ"]} />
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
                        {transaction.type === "درآمد" ? "+" : "-"}﷼{transaction.amount.toLocaleString('fa-IR')}
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
                            <SelectItem value="">دسته‌بندی نشده</SelectItem>
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
