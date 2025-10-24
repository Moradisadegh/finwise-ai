import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Input 
} from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2 
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoryManagement({
  categories,
  onAddCategory,
  onDeleteCategory
}: CategoryManagementProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>دسته‌بندی‌های هزینه</CardTitle>
        <CardDescription>
          دسته‌بندی‌های هزینه خود را مدیریت کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold">دسته‌بندی‌های شما</h3>
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
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
                <Button variant="outline" onClick={() => setShowAddCategory(false)}>
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
                  onClick={() => onDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
