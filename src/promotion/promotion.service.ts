import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PromotionService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const { data, error } = await this.supabase
      .from('promotions')
      .insert({
        title: dto.title,
        description: dto.description ?? null,
      })
      .select('*')
      .single();

    if (error) this.throwPromotionError(error);
    return data as Promotion;
  }

  async findAll(): Promise<Promotion[]> {
    const { data, error } = await this.supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) this.throwPromotionError(error);
    return (data ?? []) as Promotion[];
  }

  async findOne(id: string): Promise<Promotion | null> {
    const { data, error } = await this.supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.throwPromotionError(error);
    return data as Promotion | null;
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    const body: Partial<Promotion> = {
      updated_at: new Date().toISOString(),
    };
    if (dto.title !== undefined) body.title = dto.title;
    if (dto.description !== undefined) body.description = dto.description;

    const { data, error } = await this.supabase
      .from('promotions')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (error) this.throwPromotionError(error);
    return data as Promotion;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) this.throwPromotionError(error);
  }

  private throwPromotionError(error: { message?: string }): never {
    const msg = (error?.message ?? String(error)).toLowerCase();
    const isTableMissing =
      msg.includes('schema cache') ||
      msg.includes('could not find the table') ||
      (msg.includes('promotions') &&
        (msg.includes('cache') ||
          msg.includes('table') ||
          msg.includes('relation')));

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Promotions table missing',
          message:
            'Run supabase/create-promotions-table.sql in Supabase SQL Editor.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: 'Promotion request failed.',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
