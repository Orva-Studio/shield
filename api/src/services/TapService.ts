import type { Tap, CreateTapInput, TapStats, TapListQuery } from '../types.ts';

export class TapService {
  constructor(private db: D1Database) {}

  // Creates a new tap record for a user
  async create(userId: string, input: CreateTapInput): Promise<Tap> {
    const timestamp = input.timestamp ?? Math.floor(Date.now() / 1000);
    const now = Math.floor(Date.now() / 1000);

    const result = await this.db
      .prepare(
        'INSERT INTO taps (user_id, type, category, timestamp, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *'
      )
      .bind(userId, input.type, input.category ?? null, timestamp, now)
      .first<Tap>();

    if (!result) {
      throw new Error('Failed to create tap');
    }

    return result;
  }

  // Lists taps for a user with optional date range filtering
  async list(userId: string, query: TapListQuery): Promise<Tap[]> {
    const limit = query.limit ?? 100;
    let sql = 'SELECT * FROM taps WHERE user_id = ?';
    const params: (string | number)[] = [userId];

    if (query.from) {
      sql += ' AND timestamp >= ?';
      params.push(query.from);
    }

    if (query.to) {
      sql += ' AND timestamp <= ?';
      params.push(query.to);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(sql);
    const result = await stmt.bind(...params).all<Tap>();

    return result.results;
  }

  // Gets statistics for a user's taps
  async getStats(userId: string): Promise<TapStats> {
    const countsResult = await this.db
      .prepare(
        `SELECT 
          SUM(CASE WHEN type = 'resist' THEN 1 ELSE 0 END) as total_resists,
          SUM(CASE WHEN type = 'yield' THEN 1 ELSE 0 END) as total_yields
        FROM taps WHERE user_id = ?`
      )
      .bind(userId)
      .first<{ total_resists: number; total_yields: number }>();

    const lastTapResult = await this.db
      .prepare(
        'SELECT timestamp FROM taps WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1'
      )
      .bind(userId)
      .first<{ timestamp: number }>();

    const streak = await this.calculateStreak(userId);

    return {
      total_resists: countsResult?.total_resists ?? 0,
      total_yields: countsResult?.total_yields ?? 0,
      current_streak: streak,
      last_tap_date: lastTapResult
        ? new Date(lastTapResult.timestamp * 1000).toISOString().split('T')[0]!
        : null,
    };
  }

  // Calculates current resist streak (consecutive days with only resist taps)
  private async calculateStreak(userId: string): Promise<number> {
    // Get all taps ordered by date descending
    const taps = await this.db
      .prepare(
        `SELECT 
          date(timestamp, 'unixepoch') as tap_date,
          SUM(CASE WHEN type = 'yield' THEN 1 ELSE 0 END) as yield_count
        FROM taps 
        WHERE user_id = ?
        GROUP BY tap_date
        ORDER BY tap_date DESC`
      )
      .bind(userId)
      .all<{ tap_date: string; yield_count: number }>();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let expectedDate = today;

    for (const day of taps.results) {
      // If there's a gap in dates, streak is broken
      if (day.tap_date !== expectedDate) {
        // Allow for today not having taps yet
        if (streak === 0 && day.tap_date === this.getPreviousDate(today)) {
          expectedDate = day.tap_date;
        } else {
          break;
        }
      }

      // If any yields on this day, streak is broken
      if (day.yield_count > 0) {
        break;
      }

      streak++;
      expectedDate = this.getPreviousDate(expectedDate);
    }

    return streak;
  }

  // Gets the previous date in YYYY-MM-DD format
  private getPreviousDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0]!;
  }
}
