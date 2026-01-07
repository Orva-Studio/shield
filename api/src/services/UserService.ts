import type { User } from '../types.ts';

// UserService handles app-specific user queries.
// Note: User creation/authentication is handled by Better Auth.
export class UserService {
  constructor(private db: D1Database) {}

  // Finds a user by their ID
  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();

    return result ?? null;
  }

  // Finds a user by their email
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    return result ?? null;
  }
}
