// ─── Domain types ──────────────────────────────────────────────────────────

export type UserRole = 'contributor' | 'maintainer';
export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// User shape safe to return in responses (no password)
export type SafeUser = Omit<User, 'password'>;

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: {
    id: number;
    name: string;
    role: UserRole;
  };
}

// ─── Request body types ─────────────────────────────────────────────────────

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
}

export interface IssueQueryParams {
  sort?: 'newest' | 'oldest';
  type?: IssueType;
  status?: IssueStatus;
}

// ─── JWT payload ────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

// ─── Express augmentation ───────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
