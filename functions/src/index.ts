import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import type { Request, Response } from 'express';

export const helloWorld = onRequest((request: Request, response: Response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from EaglePass Cloud Functions!');
}); 