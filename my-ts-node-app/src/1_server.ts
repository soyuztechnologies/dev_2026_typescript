import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';

interface User {
  id: number;
  username: string;
  email: string;
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// In-memory database
const users: User[] = [
  { id: 1, username: 'user1', email: 'user1@example.com' },
  { id: 2, username: 'user2', email: 'user2@example.com' }
];

// Routes
app.get('/api/users', (req: Request, res: Response) => {
  res.json(users);
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === parseInt(req.params.id as string));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.post('/api/users', (req: Request, res: Response) => {
  const { username, email } = req.body;
 
  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required' });
  }
 
  const newUser: User = {
    id: users.length + 1,
    username,
    email
  };
 
  users.push(newUser);
  res.status(201).json(newUser);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});