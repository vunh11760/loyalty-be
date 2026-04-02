import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';
import { DEFAULT_PROFILE_ROLE, type ProfileRole } from './dto/profile-roles';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  loyalty_points: number;
  loyalty_tier: string;
  role: ProfileRole;
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
          email: null,
          full_name: null,
          phone: null,
          address: null,
          loyalty_points: 0,
          loyalty_tier: 'bronze',
          role: DEFAULT_PROFILE_ROLE,
        })
        .select('*')
        .single();

      if (insertError) {
        this.throwProfilesError(insertError);
      }

      return created as Profile;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      this.throwProfilesError(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async updateProfileForUser(userId: string, updates: UpdateProfileDto): Promise<Profile> {
    const patch: Partial<Profile> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.email !== undefined) {
      patch.email = updates.email;
    }
    const nameOrFull = updates.name !== undefined ? updates.name : updates.fullName;
    if (nameOrFull !== undefined) {
      patch.full_name = nameOrFull;
    }
    if (updates.phone !== undefined) {
      patch.phone = updates.phone;
    }
    if (updates.address !== undefined) {
      patch.address = updates.address;
    }
    if (updates.loyaltyPoints !== undefined) {
      patch.loyalty_points = updates.loyaltyPoints;
    }
    if (updates.loyaltyTier !== undefined) {
      patch.loyalty_tier = updates.loyaltyTier;
    }
    if (updates.role !== undefined) {
      patch.role = updates.role;
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
      if (e instanceof HttpException) throw e;
      this.throwProfilesError(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private throwProfilesError(error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  }): never {
    const raw = error?.message ?? String(error);
    const msg = raw.toLowerCase();
    const code = error?.code;
    const details =
      [code && `code: ${code}`, error?.details, error?.hint].filter(Boolean).join(' | ') || raw;

    // RLS / permission errors often mention "table" + "profiles" — not "missing table"
    const isRlsOrPermission =
      msg.includes('row-level security') ||
      msg.includes('rls') ||
      msg.includes('permission denied') ||
      msg.includes('violates row-level security');

    // Only true PostgREST "table not exposed / not found" cases
    const isTableMissing =
      !isRlsOrPermission &&
      (msg.includes('schema cache') ||
        msg.includes('could not find the table') ||
        msg.includes('pgrst205') ||
        (msg.includes('relation') && msg.includes('does not exist') && msg.includes('profiles')));

    if (error && !msg.includes('http')) {
      console.error('[ProfileService] Database Error Source:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Profiles table missing',
          message:
            'In Supabase SQL Editor run supabase/create-profiles-table.sql, then wait ~1 min or reload API.',
          details,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: isRlsOrPermission
          ? 'RLS blocked this operation. Use SUPABASE_SERVICE_ROLE_KEY on the server, or fix policies for public.profiles.'
          : 'Profile request failed.',
        details,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  async getProfileById(userId: string): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        this.throwProfilesError(error);
      }

      if (!data) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message: `Profile not found for user ${userId}`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return data as Profile;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      this.throwProfilesError(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async updateProfileById(userId: string, updates: UpdateProfileDto): Promise<Profile> {
    const patch: Partial<Profile> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.email !== undefined) patch.email = updates.email;
    const nameOrFull = updates.name !== undefined ? updates.name : updates.fullName;
    if (nameOrFull !== undefined) patch.full_name = nameOrFull;
    if (updates.phone !== undefined) patch.phone = updates.phone;
    if (updates.address !== undefined) patch.address = updates.address;
    if (updates.loyaltyPoints !== undefined) patch.loyalty_points = updates.loyaltyPoints;
    if (updates.loyaltyTier !== undefined) patch.loyalty_tier = updates.loyaltyTier;
    if (updates.role !== undefined) patch.role = updates.role;

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(patch)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) this.throwProfilesError(error);
      if (!data) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message: `Profile not found for user ${userId}`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return data as Profile;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      this.throwProfilesError(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
