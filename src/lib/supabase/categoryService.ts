// src/lib/supabase/categoryService.ts
import { supabase } from './client'

export interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

class CategoryService {
  async getCategories(userId: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCategories:', error)
      return []
    }
  }

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
