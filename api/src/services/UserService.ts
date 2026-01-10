import type { User } from '../types.ts';

export class UserService {
  constructor(private db: D1Database) {}

  // Marks onboarding as complete for a user
  async markOnboardingComplete(userId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    
    await this.db
      .prepare('UPDATE users SET onboarding_completed = 1, updated_at = ? WHERE id = ?')
      .bind(now, userId)
      .run();
  }
}