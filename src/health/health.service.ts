import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';

@Injectable()
export class HealthService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {}

  getSupabaseHost(): string {
    const url = this.config.get<string>('SUPABASE_URL') ?? '';
    try {
      return new URL(url).hostname || url;
    } catch {
      return '(invalid SUPABASE_URL)';
    }
  }

  async checkProfilesTable(): Promise<{
    ok: boolean;
    detail?: string;
  }> {
    const { error } = await this.supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      const msg = error.message ?? '';
      const missing =
        msg.includes('schema cache') ||
        msg.includes('could not find the table') ||
        msg.toLowerCase().includes('profiles');
      return {
        ok: false,
        detail: missing
          ? 'public.profiles not visible to API (create table or wrong project / cache)'
          : msg,
      };
    }
    return { ok: true };
  }
}
