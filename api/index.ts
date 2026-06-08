import type { IncomingMessage, ServerResponse } from 'http';
import app from '../dist/app';

export default (req: IncomingMessage, res: ServerResponse) => {
  return app(req, res);
};
