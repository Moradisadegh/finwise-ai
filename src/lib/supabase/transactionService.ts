// src/lib/supabase/transactionService.ts
import { supabase } from './client'

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  user_id: string
  created_at: string
}

// اضافه کردن این interface
export interface TransactionWithCategory extends Transaction {
  category_name?: string
  category_color?: string
}

class TransactionService {
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching transactions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTransactions:', error)
      return []
    }
  }

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

  async getSpendingByCategory(userId: string): Promise<{ name: string; value: number }[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .eq('type', 'expense')

      if (error) {
        console.error('Error fetching spending data:', error)
        return []
      }

      // Group by category and sum amounts
      const spendingMap: Record<string, number> = {}
      
      data.forEach(transaction => {
        if (spendingMap[transaction.category]) {
          spendingMap[transaction.category] += transaction.amount
        } else {
          spendingMap[transaction.category] = transaction.amount
        }
      })

      return Object.entries(spendingMap).map(([name, value]) => ({
        name,
        value
      }))
    } catch (error) {
      console.error('Error in getSpendingByCategory:', error)
      return []
    }
  }

  async getMonthlyCashFlow(userId: string): Promise<{ month: string; income: number; expenses: number }[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching cash flow data:', error)
        return []
      }

      // Group by month
      const monthlyData: Record<string, { income: number; expenses: number }> = {}
      
      data.forEach(transaction => {
        const month = transaction.date.substring(0, 7) // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expenses: 0 }
        }
        
        if (transaction.type === 'income') {
          monthlyData[month].income += transaction.amount
        } else {
          monthlyData[month].expenses += transaction.amount
        }
      })

      return Object.entries(monthlyData).map(([month, values]) => ({
        month,
        income: values.income,
        expenses: values.expenses
      }))
    } catch (error) {
      console.error('Error in getMonthlyCashFlow:', error)
      return []
    }
  }
}

export const transactionService = new TransactionService()
