// src/lib/categoryService.ts
import { supabase } from '@/lib/supabaseClient'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export class CategoryService {
  // دریافت دسته‌بندی‌های کاربر
  async getUserCategories(userId: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserCategories:', error)
      return []
    }
  }

  // ایجاد دسته‌بندی جدید
  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createCategory:', error)
      return null
    }
  }

  // بروزرسانی دسته‌بندی
  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('Error updating category:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateCategory:', error)
      return false
    }
  }

  // حذف دسته‌بندی
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteCategory:', error)
      return false
    }
  }
}

export const categoryService = new CategoryService()
