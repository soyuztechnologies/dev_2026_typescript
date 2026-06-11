import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import 'reflect-metadata';

import type { User, CreateUserBody, UserParams, ApiResponse } from './types';
import { LogMethod } from './decorators/logger.decorator';

const app = express();
const PORT: number = parseInt(process.env['PORT'] ?? '3000', 10);
app.use(json());

const users: User[] = [
  { id: 1, username: 'user1', email: 'user1@example.com' },
  { id: 2, username: 'user2', email: 'user2@example.com' }
];

// ─────────────────────────────────────────────
// ✅ Move handlers into a class so @LogMethod works
// ─────────────────────────────────────────────
class UserController {

  @LogMethod  // ✅ valid — this is a class method
  getAll(_req: Request, res: Response): void {
    const response: ApiResponse<User[]> = { data: users, success: true };
    res.json(response);
  }

  @LogMethod  // ✅ valid — this is a class method
  getById(req: Request<UserParams>, res: Response): void {
    const rawId: string = req.params['id'] ?? '';
    const parsedId: number = parseInt(rawId, 10);

    if (isNaN(parsedId)) {
      res.status(400).json({ message: 'Invalid ID', success: false });
      return;
    }

    const user = users.find((u: User) => u.id === parsedId);

    if (!user) {
      res.status(404).json({ message: 'User not found', success: false });
      return;
    }

    res.json({ data: user, success: true });
  }

  @LogMethod  // ✅ valid — this is a class method
  create(req: Request<{}, {}, CreateUserBody>, res: Response): void {
    const { username, email } = req.body;

    if (!username?.trim() || !email?.trim()) {
      res.status(400).json({ message: 'Username and email are required', success: false });
      return;
    }

    const newUser: User = { id: users.length + 1, username, email };
    users.push(newUser);
    res.status(201).json({ data: newUser, success: true });
  }
}

// ─────────────────────────────────────────────
// Instantiate and bind — 'this' must be bound
// or arrow functions used, otherwise 'this' is
// lost when Express calls the handler
// ─────────────────────────────────────────────
const ctrl = new UserController();

app.get('/api/users',     ctrl.getAll.bind(ctrl));   // .bind() preserves 'this'
app.get('/api/users/:id', ctrl.getById.bind(ctrl));
app.post('/api/users',    ctrl.create.bind(ctrl));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', success: false });
});

app.listen(PORT, (): void => {
  console.log(`Server running on http://localhost:${PORT}`);
});