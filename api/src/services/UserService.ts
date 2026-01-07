import type { User, AuthUser } from '../types.ts';

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

  // Creates a new user from Cloudflare Access auth data
  async create(authUser: AuthUser): Promise<User> {
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)')
      .bind(authUser.id, authUser.email, now)
      .run();

    const user: User = {
      id: authUser.id,
      email: authUser.email,
      created_at: now,
    };

    return user;
  }

  // Finds existing user or creates a new one (upsert pattern)
  async findOrCreate(authUser: AuthUser): Promise<User> {
    const existing = await this.findById(authUser.id);

    if (existing) {
      return existing;
    }

    return this.create(authUser);
  }
}
