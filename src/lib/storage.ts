import { supabase } from './supabase'

export async function uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      return { url: null, error: uploadError.message }
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    
    return { url: data.publicUrl, error: null }
  } catch (err: any) {
    return { url: null, error: err.message }
  }
}

export async function deleteFile(bucket: string, path: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])
    return { error: error ? error.message : null }
  } catch (err: any) {
    return { error: err.message }
  }
}
