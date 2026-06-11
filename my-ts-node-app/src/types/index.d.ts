// index.d.ts — barrel file, re-exports everything from all type files
// Consumers import from one place: import type { User } from './types'

export type { User, CreateUserBody, UserParams, ApiResponse } from './user';
// Add more exports here as your app grows:
// export type { AuthToken, JwtPayload } from './auth';
// export type { ProductBody, ProductParams } from './product';