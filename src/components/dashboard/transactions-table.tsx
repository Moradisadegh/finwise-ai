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
import { format } from "date-fns";
import { faIR } from "date-fns/locale";

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

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
  onCategoryChange: (transactionId: string, categoryId: string) => void;
}

export default function TransactionsTable({
  transactions,
  categories,
  onCategoryChange
}: TransactionsTableProps) {
  // قالب‌بندی اعداد به فرمت ایرانی
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  // قالب‌بندی تاریخ به فارسی
  const formatDate = (date: Date): string => {
    return format(date, "PPP", { locale: faIR });
  };

  return (
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
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className={transaction.type === "درآمد" ? "text-green-600" : "text-red-600"}>
                  {transaction.type === "درآمد" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Select 
                    value={categories.find(c => c.name === transaction.category)?.id || ""}
                    onValueChange={(value) => onCategoryChange(transaction.id, value)}
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
  );
}
