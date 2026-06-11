import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import 'reflect-metadata';

import type { User, CreateUserBody, UserParams, ApiResponse } from './types';
import { LogMethod } from './decorators/logger.decorator';

type UserUpdate = Partial<User>;

// ✅ All of these are valid — no field is required
const update1: UserUpdate = { username: 'newName' };         // only username
const update2: UserUpdate = { email: 'new@mail.com' };       // only email
const update3: UserUpdate = { id: 1, username: 'Anubhav' };   // two fields
const update4: UserUpdate = {};                               // empty is fine too


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

// ─────────────────────────────────────────────
// Partial<T>
// Converts every property to optional (adds ?)
// Perfect for PATCH/update endpoints where user
// sends only the fields they want to change
// ─────────────────────────────────────────────

// What TypeScript generates internally:
// type Partial<User> = {
//   id?:       number  | undefined
//   username?: string  | undefined
//   email?:    string  | undefined
//   age?:      number  | undefined
//   address?:  string  | undefined
// }

    @LogMethod
    patch(req: Request<UserParams, {}, Partial<Pick<User, 'username' | 'email'>>>, res: Response): void {
    
    // ── 1. Validate & parse ID from route param ───────────────────────────
    const rawId    = req.params['id'] ?? '';
    const parsedId = parseInt(rawId, 10);

    if (isNaN(parsedId)) {
        res.status(400).json({ message: 'Invalid ID format', success: false });
        return;
    }

    // ── 2. Find user in DB ────────────────────────────────────────────────
    const index = users.findIndex((u: User) => u.id === parsedId);

    if (index === -1) {
        res.status(404).json({ message: 'User not found', success: false });
        return;
    }

    // ── 3. Validate body — at least one field must be provided ────────────
    const { username, email } = req.body;
    // Partial<Pick<User, 'username' | 'email'>> means:
    //   username?: string | undefined
    //   email?:    string | undefined
    //   id, age, address → not accessible at all ✅

    if (!username && !email) {
        res.status(400).json({ message: 'Provide at least username or email', success: false });
        return;
    }

    if (username !== undefined && !username.trim()) {
        res.status(400).json({ message: 'Username cannot be empty', success: false });
        return;
    }

    if (email !== undefined && !email.trim()) {
        res.status(400).json({ message: 'Email cannot be empty', success: false });
        return;
    }

    // ── 4. Merge only provided fields — untouched fields stay as-is ───────
    const existingUser: User  = users[index] as User;
    const updatedUser:  User  = {
        ...existingUser,                          // keep all existing fields
        ...(username && { username }),            // override only if provided
        ...(email    && { email    })             // override only if provided
    };

    users[index] = updatedUser;

    // ── 5. Respond with updated user ──────────────────────────────────────
    const response: ApiResponse<User> = { data: updatedUser, success: true };
    res.json(response);
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
app.patch('/api/users/:id', ctrl.patch.bind(ctrl));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', success: false });
});

app.listen(PORT, (): void => {
  console.log(`Server running on http://localhost:${PORT}`);
});