// src/lib/fileService.ts
import { supabase } from '@/lib/supabase/Client'

export interface UploadedFile {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_at: string
}

export class FileService {
  async uploadFile(file: File, userId: string): Promise<UploadedFile | null> {
    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bank-statements')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return null
      }

      const { data, error } = await supabase
        .from('uploaded_files')
        .insert([
          {
            user_id: userId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            uploaded_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error saving file info:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in uploadFile:', error)
      return null
    }
  }

  async getUserFiles(userId: string): Promise<UploadedFile[]> {
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error fetching user files:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserFiles:', error)
      return []
    }
  }

  async deleteFile(fileId: string, filePath: string): Promise<boolean> {
    try {
      const { error: storageError } = await supabase.storage
        .from('bank-statements')
        .remove([filePath])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        return false
      }

      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId)

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

  async getFileUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from('bank-statements')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error in getFileUrl:', error)
      return null
    }
  }
}

export const fileService = new FileService()
