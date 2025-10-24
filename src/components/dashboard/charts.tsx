import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "درآمد" | "هزینه";
  category: string;
  category_id: string;
}

interface ChartsProps {
  categories: Category[];
  transactions: Transaction[];
}

export default function Charts({ categories, transactions }: ChartsProps) {
  // قالب‌بندی اعداد به فرمت ایرانی
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  // داده‌های نمودار دایره‌ای
  const categorySpendingData = categories.map(cat => ({
    name: cat.name,
    value: transactions
      .filter(t => t.category === cat.name && t.type === "هزینه")
      .reduce((sum, t) => sum + t.amount, 0)
  })).filter(item => item.value > 0);

  // داده‌های نمودار میله‌ای
  const monthlyCashFlowData = [
    { month: "فروردین", income: 15000000, expenses: 12000000 },
    { month: "اردیبهشت", income: 16000000, expenses: 13000000 },
    { month: "خرداد", income: 15500000, expenses: 12500000 },
    { month: "تیر", income: 17000000, expenses: 14000000 },
    { month: "مرداد", income: 16500000, expenses: 13500000 },
  ];

  return (
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
              <Bar dataKey="expenses" fill="#FF6B6B" name="هزینه" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
