import { IssueRecord, IssueWithReporter, IssueReporter } from '../modules/issues/issues.types';

/**
 * Format issue response with fields in specification order
 * For responses that include reporter_id (Create, Update, Delete)
 */
export function formatIssueResponse(issue: IssueRecord) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter_id: issue.reporter_id,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
}

/**
 * Format issue response with reporter object
 * For GET endpoints that return reporter details
 */
export function formatIssueWithReporterResponse(issue: IssueWithReporter) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: issue.reporter.id,
      name: issue.reporter.name,
      role: issue.reporter.role,
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
}

/**
 * Format user response (for signup/login)
 */
export function formatUserResponse(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
