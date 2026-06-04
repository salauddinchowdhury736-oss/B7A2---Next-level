import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { issuesService } from './issues.service';
import { CreateIssueBody, UpdateIssueBody, IssueQueryParams } from './issues.types';
import { sendSuccess, sendError } from '../../utils/response';

export class IssuesController {
  async createIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateIssueBody;
      const reporterId = req.user!.id;
      const issue = await issuesService.createIssue(body, reporterId);
      sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.BAD_REQUEST) {
        sendError(res, StatusCodes.BAD_REQUEST, error.message);
        return;
      }
      next(err);
    }
  }

  async getAllIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as unknown as IssueQueryParams;
      const issues = await issuesService.getAllIssues(params);
      sendSuccess(res, StatusCodes.OK, 'Issues retrived successfully', issues);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.BAD_REQUEST) {
        sendError(res, StatusCodes.BAD_REQUEST, error.message);
        return;
      }
      next(err);
    }
  }

  async getIssueById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
        return;
      }
      const issue = await issuesService.getIssueById(id);
      sendSuccess(res, StatusCodes.OK, 'Issue retrived successfully', issue);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.NOT_FOUND) {
        sendError(res, StatusCodes.NOT_FOUND, error.message);
        return;
      }
      next(err);
    }
  }

  async updateIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
        return;
      }
      const body = req.body as UpdateIssueBody;
      const { id: requesterId, role } = req.user!;
      const issue = await issuesService.updateIssue(id, body, requesterId, role);
      sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', issue);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.NOT_FOUND) {
        sendError(res, StatusCodes.NOT_FOUND, error.message);
        return;
      }
      if (code === StatusCodes.FORBIDDEN) {
        sendError(res, StatusCodes.FORBIDDEN, error.message);
        return;
      }
      if (code === StatusCodes.CONFLICT) {
        sendError(res, StatusCodes.CONFLICT, error.message);
        return;
      }
      if (code === StatusCodes.BAD_REQUEST) {
        sendError(res, StatusCodes.BAD_REQUEST, error.message);
        return;
      }
      next(err);
    }
  }

  async deleteIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
        return;
      }
      await issuesService.deleteIssue(id);
      sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.NOT_FOUND) {
        sendError(res, StatusCodes.NOT_FOUND, error.message);
        return;
      }
      next(err);
    }
  }
}

export const issuesController = new IssuesController();
