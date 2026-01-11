import type { User } from '../types.ts';

export class UserService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // Marks onboarding as complete for a user
  async markOnboardingComplete(userId: string): Promise<void> {
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    
    await this.db
      .prepare('UPDATE users SET onboarding_completed = 1, updated_at = ? WHERE id = ?')
      .bind(currentUnixTimestamp, userId)
      .run();
  }
}