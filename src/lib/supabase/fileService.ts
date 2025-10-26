// src/lib/supabase/fileService.ts
import { supabase } from './client'

export interface FinancialFile {
  id: string
  name: string
  url: string
  user_id: string
  created_at: string
}

class FileService {
  async uploadFile(file: File, userId: string): Promise<FinancialFile | null> {
    try {
      const fileName = `${userId}/${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('financial-statements')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('financial-statements')
        .getPublicUrl(fileName)

      const fileRecord: Omit<FinancialFile, 'id' | 'created_at'> = {
        name: file.name,
        url: publicUrl,
        user_id: userId
      }

      const { data: recordData, error: recordError } = await supabase
        .from('financial_files')
        .insert([fileRecord])
        .select()
        .single()

      if (recordError) {
        console.error('Error saving file record:', recordError)
        return null
      }

      return recordData
    } catch (error) {
      console.error('Error in uploadFile:', error)
      return null
    }
  }

  async getFiles(userId: string): Promise<FinancialFile[]> {
    try {
      const { data, error } = await supabase
        .from('financial_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching files:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getFiles:', error)
      return []
    }
  }

  async deleteFile(id: string, fileName: string): Promise<boolean> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('financial-statements')
        .remove([fileName])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
      }

      // Delete record from database
      const { error: dbError } = await supabase
        .from('financial_files')
        .delete()
        .eq('id', id)

      if (dbError) {
        console.error('Error deleting file record:', dbError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteFile:', error)
      return false
    }
  }
}

export const fileService = new FileService()
