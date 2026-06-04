import pool from '../config/db';
import { QueryResult, QueryResultRow } from 'pg';

/**
 * Execute a parameterized SQL query against the pool.
 * Central helper to avoid repeating pool.query calls throughout modules.
 */
export const query = async <T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(sql, params);
};
