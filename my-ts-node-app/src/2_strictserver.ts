import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';

// ✅ STRICT: Interface is well-typed — no implicit 'any' fields allowed
interface User {
  id: number;
  username: string;
  email: string;
}

// ✅ STRICT: Explicit return type on the helper function
// Without strict: findUserById could silently return 'any'
// With strict: TypeScript forces you to handle the undefined case at call site
function findUserById(id: number): User | undefined {
  return users.find((u: User) => u.id === id);
}

// ✅ STRICT: Explicit return type — noImplicitAny flags untyped params
// Without strict: (username, email) would be silently typed as 'any'
function createUser(username: string, email: string): User {
  const newUser: User = {
    id: users.length + 1,
    username,  // TypeScript knows these are strings — no 'any' slipping in
    email
  };
  return newUser;
}

const app = express();
const PORT: number = parseInt(process.env.PORT ?? '3000', 10);
//                                              ^^^^^^^^^^^
// ✅ STRICT: strictNullChecks flags that process.env.PORT can be undefined
// The nullish coalescing '??' operator safely provides a fallback string
// parseInt() ensures PORT is always a number, not string | undefined

app.use(json());

const users: User[] = [
  { id: 1, username: 'user1', email: 'user1@example.com' },
  { id: 2, username: 'user2', email: 'user2@example.com' }
];

// GET all users
app.get('/api/users', (_req: Request, res: Response): void => {
  //                   ^^^^
  // ✅ STRICT: Prefix unused params with '_' to satisfy noUnusedParameters
  // ✅ STRICT: Explicit ': void' return type on route handlers
  res.json(users);
});

// GET user by ID
app.get('/api/users/:id', (req: Request, res: Response): void => {
  const rawId: string = String(req.params['id']) ?? '';
  const parsedId: number = parseInt(rawId, 10);

  // ✅ STRICT: NaN check required because parseInt() can return NaN
  // Without strict: you could skip this and pass NaN directly to findUserById
  if (isNaN(parsedId)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return; // ✅ STRICT: explicit return instead of chained return res.json()
  }

  const user: User | undefined = findUserById(parsedId);
  //           ^^^^^^^^^^^^^^^^
  // ✅ STRICT: strictNullChecks forces you to handle 'undefined' explicitly
  // Without strict: user could be undefined and you'd call user.id and crash

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(user); // TypeScript now KNOWS user is User (not undefined)
});

// POST create user
app.post('/api/users', (req: Request, res: Response): void => {
  // ✅ STRICT: req.body is typed as 'any' by Express — we narrow it safely
  const body = req.body as { username?: unknown; email?: unknown };
  //                                  ^^^^^^^         ^^^^^^^
  // Use 'unknown' instead of 'any' for untrusted external input (req.body)
  // 'unknown' forces you to validate before use — 'any' lets you skip checks

  const { username, email } = body;

  // ✅ STRICT: Type guards validate unknown → string before using the values
  if (typeof username !== 'string' || typeof email !== 'string') {
    res.status(400).json({ message: 'Username and email must be strings' });
    return;
  }

  if (!username.trim() || !email.trim()) {
    res.status(400).json({ message: 'Username and email are required' });
    return;
  }

  const newUser: User = createUser(username, email);
  users.push(newUser);
  res.status(201).json(newUser);
});

// ✅ STRICT: Error handler — all 4 params explicitly typed
// Express detects error middleware by the 4-argument signature
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});