import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';
import { CreateLoyaltyLevelDto } from './dto/create-loyalty-level.dto';
import { UpdateLoyaltyLevelDto } from './dto/update-loyalty-level.dto';

export interface LoyaltyLevel {
  id: string;
  name: string;
  min_points: number;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class LoyaltyLevelService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async create(dto: CreateLoyaltyLevelDto): Promise<LoyaltyLevel> {
    const { data, error } = await this.supabase
      .from('loyalty_levels')
      .insert({
        name: dto.name,
        min_points: dto.min_points ?? 0,
        description: dto.description ?? null,
        sort_order: dto.sort_order ?? 0,
      })
      .select('*')
      .single();

    if (error) this.throwLevelError(error);
    return data as LoyaltyLevel;
  }

  async findAll(): Promise<LoyaltyLevel[]> {
    const { data, error } = await this.supabase
      .from('loyalty_levels')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('min_points', { ascending: true });

    if (error) this.throwLevelError(error);
    return (data ?? []) as LoyaltyLevel[];
  }

  async findOne(id: string): Promise<LoyaltyLevel | null> {
    const { data, error } = await this.supabase
      .from('loyalty_levels')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.throwLevelError(error);
    return data as LoyaltyLevel | null;
  }

  async update(id: string, dto: UpdateLoyaltyLevelDto): Promise<LoyaltyLevel> {
    const body: Partial<LoyaltyLevel> = {
      updated_at: new Date().toISOString(),
    };
    if (dto.name !== undefined) body.name = dto.name;
    if (dto.min_points !== undefined) body.min_points = dto.min_points;
    if (dto.description !== undefined) body.description = dto.description;
    if (dto.sort_order !== undefined) body.sort_order = dto.sort_order;

    const { data, error } = await this.supabase
      .from('loyalty_levels')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (error) this.throwLevelError(error);
    return data as LoyaltyLevel;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('loyalty_levels')
      .delete()
      .eq('id', id);

    if (error) this.throwLevelError(error);
  }

  private throwLevelError(error: { message?: string }): never {
    const msg = (error?.message ?? String(error)).toLowerCase();
    const isTableMissing =
      msg.includes('schema cache') ||
      msg.includes('could not find the table') ||
      (msg.includes('loyalty_levels') &&
        (msg.includes('cache') || msg.includes('table') || msg.includes('relation')));

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Loyalty levels table missing',
          message:
            'Run supabase/create-loyalty-levels-table.sql in Supabase SQL Editor.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: 'Loyalty level request failed.',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
