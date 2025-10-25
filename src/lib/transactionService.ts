// src/lib/transactionService.ts
import { supabase } from '@/lib/supabaseClient'

export interface Transaction {
  id: string
  user_id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string | null
  file_id: string | null
  created_at: string
}

export interface TransactionWithCategory extends Transaction {
  category?: {
    name: string
    color: string
  }
}

export class TransactionService {
  // دریافت تراکنش‌های کاربر
  async getUserTransactions(userId: string): Promise<TransactionWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, color)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching transactions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserTransactions:', error)
      return []
    }
  }

  // ایجاد تراکنش جدید
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single()

      if (error) {
        console.error('Error creating transaction:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createTransaction:', error)
      return null
    }
  }

  // بروزرسانی تراکنش
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('Error updating transaction:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateTransaction:', error)
      return false
    }
  }

  // حذف تراکنش
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting transaction:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteTransaction:', error)
      return false
    }
  }

  // دریافت خلاصه مالی کاربر
  async getUserFinancialSummary(userId: string): Promise<{
    totalIncome: number
    totalExpenses: number
    netSavings: number
  }> {
    try {
      // درآمدها
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'income')

      if (incomeError) {
        console.error('Error fetching income:', incomeError)
        return { totalIncome: 0, totalExpenses: 0, netSavings: 0 }
      }

      // هزینه‌ها
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')

      if (expenseError) {
        console.error('Error fetching expenses:', expenseError)
        return { totalIncome: 0, totalExpenses: 0, netSavings: 0 }
      }

      const totalIncome = incomeData?.reduce((sum, t) => sum + t.amount, 0) || 0
      const totalExpenses = expenseData?.reduce((sum, t) => sum + t.amount, 0) || 0
      const netSavings = totalIncome - totalExpenses

      return { totalIncome, totalExpenses, netSavings }
    } catch (error) {
      console.error('Error in getUserFinancialSummary:', error)
      return { totalIncome: 0, totalExpenses: 0, netSavings: 0 }
    }
  }

  // دریافت داده‌های نمودار دسته‌بندی‌ها
  async getCategorySpendingData(userId: string): Promise<{ name: string; value: number; color: string }[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories(name, color)
        `)
        .eq('user_id', userId)
        .eq('type', 'expense')
        .not('category_id', 'is', null)

      if (error) {
        console.error('Error fetching category spending data:', error)
        return []
      }

      // گروه‌بندی بر اساس دسته‌بندی
      const categoryMap: Record<string, { name: string; value: number; color: string }> = {}
      
      data?.forEach(transaction => {
        if (transaction.category) {
          const key = transaction.category.name
          if (!categoryMap[key]) {
            categoryMap[key] = {
              name: transaction.category.name,
              value: 0,
              color: transaction.category.color || '#8884d8'
            }
          }
          categoryMap[key].value += transaction.amount
        }
      })

      return Object.values(categoryMap)
    } catch (error) {
      console.error('Error in getCategorySpendingData:', error)
      return []
    }
  }

  // دریافت داده‌های نمودار جریان نقدی ماهانه
  async getMonthlyCashFlowData(userId: string): Promise<{ month: string; income: number; expenses: number }[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .eq('user_id', userId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString())

      if (error) {
        console.error('Error fetching monthly cash flow data:', error)
        return []
      }

      // گروه‌بندی بر اساس ماه
      const monthMap: Record<string, { month: string; income: number; expenses: number }> = {}
      
      data?.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        const monthName = date.toLocaleDateString('fa-IR', { month: 'short', year: 'numeric' })
        
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = {
            month: monthName,
            income: 0,
            expenses: 0
          }
        }
        
        if (transaction.type === 'income') {
          monthMap[monthKey].income += transaction.amount
        } else {
          monthMap[monthKey].expenses += transaction.amount
        }
      })

      return Object.values(monthMap).sort((a, b) => {
        const [aYear, aMonth] = a.month.split('-')
        const [bYear, bMonth] = b.month.split('-')
        return new Date(parseInt(aYear), parseInt(aMonth) - 1).getTime() - 
               new Date(parseInt(bYear), parseInt(bMonth) - 1).getTime()
      })
    } catch (error) {
      console.error('Error in getMonthlyCashFlowData:', error)
      return []
    }
  }
}

export const transactionService = new TransactionService()
