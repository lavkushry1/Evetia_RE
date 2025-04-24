import { createClient } from '@supabase/supabase-js';
import config from '../config';

class SupabaseService {
  private static instance: SupabaseService;
  private supabase: any;

  private constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): any {
    return this.supabase;
  }

  public async uploadFile(bucket: string, path: string, file: any): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      const { publicURL } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicURL;
    } catch (error) {
      console.error('Failed to upload file to Supabase:', error);
      throw error;
    }
  }

  public async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete file from Supabase:', error);
      throw error;
    }
  }

  public async listFiles(bucket: string, path?: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(path);

      if (error) throw error;

      return data.map((file: any) => file.name);
    } catch (error) {
      console.error('Failed to list files from Supabase:', error);
      throw error;
    }
  }
}

export const supabase = SupabaseService.getInstance().getClient(); 