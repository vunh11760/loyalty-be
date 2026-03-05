import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface Profile {
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
export class ProfileService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async getOrCreateProfileByUserId(userId: string): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        this.throwProfilesError(error);
      }

      if (data) {
        return data as Profile;
      }

      const { data: created, error: insertError } = await this.supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: null,
          phone: null,
          loyalty_points: 0,
          loyalty_tier: 'bronze',
        })
        .select('*')
        .single();

      if (insertError) {
        this.throwProfilesError(insertError);
      }

      return created as Profile;
    } catch (e) {
      this.throwProfilesError(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async updateProfileForUser(
    userId: string,
    updates: UpdateProfileDto,
  ): Promise<Profile> {
    const patch: Partial<Profile> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.fullName !== undefined) {
      patch.full_name = updates.fullName;
    }
    if (updates.phone !== undefined) {
      patch.phone = updates.phone;
    }
    if (updates.loyaltyPoints !== undefined) {
      patch.loyalty_points = updates.loyaltyPoints;
    }
    if (updates.loyaltyTier !== undefined) {
      patch.loyalty_tier = updates.loyaltyTier;
    }

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(patch)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        this.throwProfilesError(error);
      }

      return data as Profile;
    } catch (e) {
      this.throwProfilesError(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private throwProfilesError(error: { message?: string; code?: string }): never {
    const msg = (error?.message ?? String(error)).toLowerCase();
    const isTableMissing =
      msg.includes('schema cache') ||
      msg.includes('could not find the table') ||
      (msg.includes('profiles') &&
        (msg.includes('cache') ||
          msg.includes('table') ||
          msg.includes('relation') ||
          msg.includes('does not exist')));

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Profiles table missing',
          message:
            'Create the table in Supabase: Dashboard → SQL Editor → run supabase/create-profiles-table.sql',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: 'Profile request failed. Check server logs.',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

