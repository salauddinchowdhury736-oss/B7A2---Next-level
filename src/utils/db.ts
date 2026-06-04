import { QueryResult, QueryResultRow } from 'pg';
import pool from '../config/db';

// Typed wrapper so every call site gets proper generics
export async function query<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(sql, params);
}

// Convenience: return the first row or null
export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const result = await pool.query<T>(sql, params);
  return result.rows[0] ?? null;
}

// Convenience: return all rows
export async function queryMany<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}
