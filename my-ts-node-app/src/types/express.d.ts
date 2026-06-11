// express.d.ts — augments Express's built-in types globally
// Useful when you want typed req.body across ALL routes without repeating generics

import 'express';

declare module 'express-serve-static-core' {
  // Extends Express Request interface globally
  // After this, req.user is available on every route without manual typing
  interface Request {
    user?: {
      id: number;
      username: string;
    };
    requestId?: string; // e.g. injected by a middleware
  }
}