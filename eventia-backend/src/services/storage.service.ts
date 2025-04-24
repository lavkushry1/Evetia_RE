import { supabase } from './supabase.service';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private static instance: StorageService;
  private buckets = {
    events: 'event-images',
    teams: 'team-logos',
    stadiums: 'stadium-images',
    tickets: 'ticket-pdfs',
  };

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async uploadFile(bucket: string, file: Buffer, fileType: string): Promise<string> {
    const fileName = `${uuidv4()}.${fileType}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: `image/${fileType}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  public async uploadEventImage(file: Buffer, fileType: string): Promise<string> {
    return this.uploadFile(this.buckets.events, file, fileType);
  }

  public async uploadTeamLogo(file: Buffer, fileType: string): Promise<string> {
    return this.uploadFile(this.buckets.teams, file, fileType);
  }

  public async uploadStadiumImage(file: Buffer, fileType: string): Promise<string> {
    return this.uploadFile(this.buckets.stadiums, file, fileType);
  }

  public async uploadTicketPdf(file: Buffer, bookingId: string): Promise<string> {
    const fileName = `ticket-${bookingId}.pdf`;
    const { data, error } = await supabase.storage
      .from(this.buckets.tickets)
      .upload(fileName, file, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(this.buckets.tickets)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  public async deleteFile(bucket: string, url: string): Promise<void> {
    const fileName = url.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw error;
    }
  }
}

export const storageService = StorageService.getInstance(); 