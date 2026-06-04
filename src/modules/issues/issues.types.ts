export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface IssueRecord {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface IssueReporter {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface IssueWithReporter extends Omit<IssueRecord, 'reporter_id'> {
  reporter: IssueReporter;
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
