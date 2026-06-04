import { Router } from 'express';
import { issuesController } from './issues.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';

const router = Router();

// Public routes
router.get('/', (req, res, next) => issuesController.getAllIssues(req, res, next));
router.get('/:id', (req, res, next) => issuesController.getIssueById(req, res, next));

// Authenticated routes
router.post('/', authenticate, (req, res, next) => issuesController.createIssue(req, res, next));

// Update: authenticate first, then controller handles role/ownership logic
router.patch('/:id', authenticate, (req, res, next) => issuesController.updateIssue(req, res, next));

// Maintainer only
router.delete('/:id', authenticate, requireRole('maintainer'), (req, res, next) =>
  issuesController.deleteIssue(req, res, next)
);

export default router;
