import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';

export interface ValidateUserIdResult {
  /** Always true when this object is returned (UUID format already passed API validation) */
  valid: true;
  userId: string;
  /** Whether a row exists in public.profiles for this user */
  profileExists: boolean;
}

@Injectable()
export class QrService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async validateUserId(userId: string): Promise<ValidateUserIdResult> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          error: 'Database error',
          message: 'Could not validate user id.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return {
      valid: true,
      userId,
      profileExists: !!data,
    };
  }
}
