import { StatusCodes } from 'http-status-codes';
import { query } from '../../utils/query';
import {
  IssueRecord,
  IssueWithReporter,
  IssueReporter,
  CreateIssueBody,
  UpdateIssueBody,
  IssueQueryParams,
  IssueType,
  IssueStatus,
} from './issues.types';

const VALID_TYPES: IssueType[] = ['bug', 'feature_request'];
const VALID_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved'];

/** Attach reporter details to a list of issues without using SQL JOINs */
async function attachReporters(issues: IssueRecord[]): Promise<IssueWithReporter[]> {
  if (issues.length === 0) return [];

  // Collect unique reporter IDs
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  // Single batch query — no JOIN, no ORM
  const userResult = await query<IssueReporter & { id: number }>(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [reporterIds]
  );

  // Build a lookup map for O(1) access
  const reporterMap = new Map<number, IssueReporter>();
  for (const u of userResult.rows) {
    reporterMap.set(u.id, { id: u.id, name: u.name, role: u.role });
  }

  return issues.map(({ reporter_id, ...issue }) => ({
    ...issue,
    reporter: reporterMap.get(reporter_id) ?? { id: reporter_id, name: 'Unknown', role: 'contributor' },
  }));
}

function makeError(message: string, code: number): Error {
  const err = new Error(message);
  (err as NodeJS.ErrnoException).code = String(code);
  return err;
}

export class IssuesService {
  async createIssue(body: CreateIssueBody, reporterId: number): Promise<IssueRecord> {
    const { title, description, type } = body;

    if (!title || !description || !type) {
      throw makeError('title, description, and type are required.', StatusCodes.BAD_REQUEST);
    }
    if (title.length > 150) {
      throw makeError('title must not exceed 150 characters.', StatusCodes.BAD_REQUEST);
    }
    if (description.length < 20) {
      throw makeError('description must be at least 20 characters.', StatusCodes.BAD_REQUEST);
    }
    if (!VALID_TYPES.includes(type)) {
      throw makeError('type must be bug or feature_request.', StatusCodes.BAD_REQUEST);
    }

    // Verify reporter exists in users table (no FK constraint — app-level validation)
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [reporterId]);
    if (!userCheck.rowCount || userCheck.rowCount === 0) {
      throw makeError('Reporter user not found.', StatusCodes.BAD_REQUEST);
    }

    const result = await query<IssueRecord>(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, type, reporterId]
    );

    return result.rows[0];
  }

  async getAllIssues(params: IssueQueryParams): Promise<IssueWithReporter[]> {
    const { sort = 'newest', type, status } = params;

    // Build query dynamically with parameterized values — still raw SQL, no ORM
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (type) {
      if (!VALID_TYPES.includes(type)) {
        throw makeError('Invalid type filter.', StatusCodes.BAD_REQUEST);
      }
      conditions.push(`type = $${idx++}`);
      values.push(type);
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        throw makeError('Invalid status filter.', StatusCodes.BAD_REQUEST);
      }
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

    const sql = `SELECT * FROM issues ${whereClause} ${orderClause}`;
    const result = await query<IssueRecord>(sql, values);

    return attachReporters(result.rows);
  }

  async getIssueById(id: number): Promise<IssueWithReporter> {
    const result = await query<IssueRecord>('SELECT * FROM issues WHERE id = $1', [id]);

    if (!result.rowCount || result.rowCount === 0) {
      throw makeError('Issue not found.', StatusCodes.NOT_FOUND);
    }

    const [withReporter] = await attachReporters(result.rows);
    return withReporter;
  }

  async updateIssue(
    id: number,
    body: UpdateIssueBody,
    requesterId: number,
    requesterRole: 'contributor' | 'maintainer'
  ): Promise<IssueRecord> {
    // Fetch the issue first
    const issueResult = await query<IssueRecord>('SELECT * FROM issues WHERE id = $1', [id]);

    if (!issueResult.rowCount || issueResult.rowCount === 0) {
      throw makeError('Issue not found.', StatusCodes.NOT_FOUND);
    }

    const issue = issueResult.rows[0];

    // Permission check
    if (requesterRole === 'contributor') {
      if (issue.reporter_id !== requesterId) {
        throw makeError('You can only update your own issues.', StatusCodes.FORBIDDEN);
      }
      if (issue.status !== 'open') {
        throw makeError('You can only update issues with status open.', StatusCodes.CONFLICT);
      }
    }

    // Build dynamic SET clause
    const { title, description, type } = body;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (title !== undefined) {
      if (title.length > 150) throw makeError('title must not exceed 150 characters.', StatusCodes.BAD_REQUEST);
      setClauses.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      if (description.length < 20) throw makeError('description must be at least 20 characters.', StatusCodes.BAD_REQUEST);
      setClauses.push(`description = $${idx++}`);
      values.push(description);
    }
    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) throw makeError('type must be bug or feature_request.', StatusCodes.BAD_REQUEST);
      setClauses.push(`type = $${idx++}`);
      values.push(type);
    }

    if (setClauses.length === 0) {
      throw makeError('No valid fields provided for update.', StatusCodes.BAD_REQUEST);
    }

    // Always refresh updated_at
    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE issues SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query<IssueRecord>(sql, values);

    return result.rows[0];
  }

  async deleteIssue(id: number): Promise<void> {
    const result = await query('SELECT id FROM issues WHERE id = $1', [id]);

    if (!result.rowCount || result.rowCount === 0) {
      throw makeError('Issue not found.', StatusCodes.NOT_FOUND);
    }

    await query('DELETE FROM issues WHERE id = $1', [id]);
  }
}

export const issuesService = new IssuesService();
