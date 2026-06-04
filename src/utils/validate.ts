import { IssueType, IssueStatus, UserRole } from './types';

const VALID_ROLES: UserRole[] = ['contributor', 'maintainer'];
const VALID_ISSUE_TYPES: IssueType[] = ['bug', 'feature_request'];
const VALID_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved'];

export function isValidRole(value: unknown): value is UserRole {
  return VALID_ROLES.includes(value as UserRole);
}

export function isValidIssueType(value: unknown): value is IssueType {
  return VALID_ISSUE_TYPES.includes(value as IssueType);
}

export function isValidStatus(value: unknown): value is IssueStatus {
  return VALID_STATUSES.includes(value as IssueStatus);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
