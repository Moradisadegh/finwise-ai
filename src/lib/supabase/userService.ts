// src/lib/userService.ts
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
}

export class UserService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  async createUserProfile(user: User, fullName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: fullName,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error('Error creating user profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return false
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) {
        console.error('Error updating user profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return false
    }
  }
}

export const userService = new UserService()
