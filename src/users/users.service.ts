import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';

export interface UserListItem {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  loyalty_points: number;
  loyalty_tier: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<UserListItem[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) this.throwUsersError(error);
    return (data ?? []) as UserListItem[];
  }

  private throwUsersError(error: { message?: string }): never {
    const msg = (error?.message ?? String(error)).toLowerCase();
    const isTableMissing =
      msg.includes('schema cache') ||
      msg.includes('could not find the table') ||
      (msg.includes('profiles') &&
        (msg.includes('cache') ||
          msg.includes('table') ||
          msg.includes('relation')));

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Profiles table missing',
          message:
            'Run supabase/create-profiles-table.sql in Supabase SQL Editor.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: 'Failed to list users.',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
