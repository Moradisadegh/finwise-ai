// src/lib/authService.ts
import { supabase } from '@/lib/supabase/Client'
import { User } from '@supabase/supabase-js'
import { userService } from '@/lib/supabase/userService'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthService {
  async getCurrentUser(): Promise<AuthState> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return {
        user,
        isAuthenticated: !!user
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return {
        user: null,
        isAuthenticated: false
      }
    }
  }

  async signup(email: string, password: string, name: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: User 
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })

      if (error) {
        return { 
          success: false, 
          message: error.message || 'خطا در ثبت نام' 
        }
      }

      if (!data.user) {
        return { 
          success: false, 
          message: 'ثبت نام انجام شد اما کاربر ایجاد نشد' 
        }
      }

      await userService.createUserProfile(data.user, name)

      return { 
        success: true, 
        message: 'ثبت نام با موفقیت انجام شد', 
        user: data.user 
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        message: 'خطا در ثبت نام' 
      }
    }
  }

  async login(email: string, password: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: User 
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { 
          success: false, 
          message: error.message || 'خطا در ورود' 
        }
      }

      return { 
        success: true, 
        message: 'ورود با موفقیت انجام شد', 
        user: data.user 
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: 'خطا در ورود' 
      }
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { 
          success: false, 
          message: error.message || 'خطا در خروج' 
        }
      }

      return { 
        success: true, 
        message: 'خروج با موفقیت انجام شد' 
      }
    } catch (error) {
      console.error('Logout error:', error)
      return { 
        success: false, 
        message: 'خطا در خروج' 
      }
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
