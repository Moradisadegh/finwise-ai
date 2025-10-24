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

// Types
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

// Mock data
const initialCategories: Category[] = [
  { id: "1", name: "غذا و رستوران", color: "#FF6B6B" },
  { id: "2", name: "حمل و نقل", color: "#4ECDC4" },
  { id: "3", name: "خرید", color: "#FFD166" },
  { id: "4", name: "سرگرمی", color: "#6A0572" },
  { id: "5", name: "خدمات عمومی", color: "#1A535C" },
  { id: "6", name: "حقوق", color: "#06D6A0" },
];

const initialTransactions: Transaction[] = [
  { id: "1", date: "2023-05-15", description: "سوپرمارکت", amount: 85.30, type: "expense", category: "غذا و رستوران" },
  { id: "2", date: "2023-05-14", description: "پمپ بنزین", amount: 45.00, type: "expense", category: "حمل و نقل" },
  { id: "3", date: "2023-05-12", description: "واریز حقوق", amount: 3200.00, type: "income", category: "حقوق" },
  { id: "4", date: "2023-05-10", description: "بلیط سینما", amount: 32.50, type: "expense", category: "سرگرمی" },
  { id: "5", date: "2023-05-08", description: "قبض برق", amount: 120.75, type: "expense", category: "خدمات عمومی" },
  { id: "6", date: "2023-05-05", description: "خرید اینترنتی", amount: 65.99, type: "expense", category: "خرید" },
];

const categorySpendingData = [
  { name: "غذا و رستوران", value: 320 },
  { name: "حمل و نقل", value: 180 },
  { name: "خرید", value: 250 },
  { name: "سرگرمی", value: 95 },
  { name: "خدمات عمومی", value: 120 },
];

const monthlyCashFlowData = [
  { month: "فروردین", income: 4000, expenses: 2800 },
  { month: "اردیبهشت", income: 4200, expenses: 3100 },
  { month: "خرداد", income: 3800, expenses: 2900 },
  { month: "تیر", income: 4100, expenses: 3200 },
  { month: "مرداد", income: 4300, expenses: 3500 },
];

export default function FinWiseAIDashboard() {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

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
  const handleCategoryChange = (transactionId: string, categoryId: string) => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, category: selectedCategory.name } 
            : t
        )
      );
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `${categories.length + 1}`,
        name: newCategoryName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    // Reset transactions with this category to "Uncategorized"
    setTransactions(prev => 
      prev.map(t => 
        t.category === categories.find(c => c.id === categoryId)?.name 
          ? { ...t, category: "دسته‌بندی نشده" } 
          : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">داشبورد FinWise AI</h1>
          <p className="text-gray-600">مدیریت مالی هوشمند با هوش مصنوعی</p>
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
              <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+12% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هزینه‌های کل</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+5% نسبت به ماه گذشته</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پس‌انداز خالص</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalIncome - totalExpenses).toFixed(2)}</div>
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
                  <Tooltip formatter={(value) => [`$${value}`, "مبلغ"]} />
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
                  <Tooltip formatter={(value) => [`$${value}`, "مبلغ"]} />
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
                      <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={categories.find(c => c.name === transaction.category)?.id || ""}
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
