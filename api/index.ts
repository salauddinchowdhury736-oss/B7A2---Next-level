import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/app';

export default (req: IncomingMessage, res: ServerResponse) => {
  return app(req, res);
};
