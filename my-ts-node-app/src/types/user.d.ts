// user.d.ts — all User related types live here
// No imports needed for primitive types in .d.ts files

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface CreateUserBody {
  username: string;
  email: string;
}

export interface UserParams {
  id: string; // route params are always strings in HTTP
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}