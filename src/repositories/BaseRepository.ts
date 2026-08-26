// ============================================================================
// Base Repository — Generic CRUD operations for all entities
// All repositories share this pattern for consistency
// ============================================================================

import { supabase } from '../db/connection.js';
import { SupabaseClient } from '@supabase/supabase-js';

// Tables that have deleted_at column for soft-delete
const SOFT_DELETE_TABLES = new Set([
  'contacts', 'companies', 'opportunities', 'clients',
  'invoices', 'expenses',
]);

export interface QueryFilters {
  id?: string;
  status?: string;
  owner_id?: string;
  company_id?: string;
  client_id?: string;
  campaign_id?: string;
  contact_id?: string;
  opportunity_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class BaseRepository<T extends Record<string, any>> {
  protected db: SupabaseClient;
  protected tableName: string;
  protected hasSoftDelete: boolean;

  constructor(tableName: string) {
    this.db = supabase;
    this.tableName = tableName;
    this.hasSoftDelete = SOFT_DELETE_TABLES.has(tableName);
  }

  async findById(id: string): Promise<T | null> {
    let query = this.db
      .from(this.tableName)
      .select('*')
      .eq('id', id);

    if (this.hasSoftDelete) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as T;
  }

  async findAll(filters: QueryFilters = {}): Promise<T[]> {
    let query = this.db.from(this.tableName).select('*');

    // Apply soft-delete filter only if table supports it
    if (this.hasSoftDelete) {
      query = query.is('deleted_at', null);
    }

    // Apply common filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.owner_id) query = query.eq('owner_id', filters.owner_id);
    if (filters.company_id) query = query.eq('company_id', filters.company_id);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
    if (filters.contact_id) query = query.eq('contact_id', filters.contact_id);
    if (filters.opportunity_id) query = query.eq('opportunity_id', filters.opportunity_id);
    if ((filters as any).active !== undefined) query = query.eq('active', (filters as any).active);

    // Pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by most recent
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as T[];
  }

  async create(record: Partial<T>): Promise<T> {
    const { data, error } = await this.db
      .from(this.tableName)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await this.db
      .from(this.tableName)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    if (!this.hasSoftDelete) {
      throw new Error(`Table ${this.tableName} does not support soft delete`);
    }
    const { error } = await this.db
      .from(this.tableName)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async search(field: string, value: string): Promise<T[]> {
    let query = this.db
      .from(this.tableName)
      .select('*')
      .ilike(field, `%${value}%`);

    if (this.hasSoftDelete) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return (data || []) as T[];
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    let query = this.db
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (this.hasSoftDelete) {
      query = query.is('deleted_at', null);
    }

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}
