// Gamification Service — XP and Streak engine with advanced features
import { query, withTransaction, getRedis } from "@loksewa/shared-utils";
import type { UserXP, UserStreak, Badge } from "@loksewa/shared-types";

// XP rules (from SAS §13.1)
export const XP_RULES = {
  CORRECT_EASY: 10,
  CORRECT_MEDIUM: 15,
  CORRECT_HARD: 25,
  WRONG: 2,
  PERFECT_QUIZ: 50,
  STREAK_3: 30,
  STREAK_7: 100,
  STREAK_30: 500,
  MOCK_PASS: 200,
  MOCK_TOP_10: 300,
  DAILY_MISSION_COMPLETE: 50,
  AI_HELPFUL: 5,
  FIRST_QUESTION: 10,
  REVIEW_TOPIC: 20,
  SHARE: 15,
} as const;

// Badge definitions (from SAS §13.5)
export const BADGE_DEFINITIONS: Record<string, Partial<Badge> & { condition: string }> = {
  first_step: {
    name: "First Step",
    description: "Answered your first question",
    tier: "bronze",
    xp_reward: 0,
    condition: "xp > 0"
  },
  streak_7: {
    name: "Week Warrior",
    description: "7-day streak achieved",
    tier: "silver",
    xp_reward: 50,
    condition: "current_streak >= 7"
  },
  streak_30: {
    name: "Dedicated Learner",
    description: "30-day streak",
    tier: "gold",
    xp_reward: 200,
    condition: "current_streak >= 30"
  },
  streak_100: {
    name: "Unstoppable",
    description: "100-day streak",
    tier: "platinum",
    xp_reward: 500,
    condition: "current_streak >= 100"
  },
  streak_365: {
    name: "Eternal Scholar",
    description: "365-day streak",
    tier: "legendary",
    xp_reward: 2000,
    condition: "current_streak >= 365"
  },
  level_5: {
    name: "Apprentice",
    description: "Reached level 5",
    tier: "bronze",
    xp_reward: 100,
    condition: "level >= 5"
  },
  level_10: {
    name: "Scholar",
    description: "Reached level 10",
    tier: "silver",
    xp_reward: 250,
    condition: "level >= 10"
  },
  level_20: {
    name: "Expert",
    description: "Reached level 20",
    tier: "gold",
    xp_reward: 500,
    condition: "level >= 20"
  },
  level_50: {
    name: "Grandmaster",
    description: "Reached level 50",
    tier: "platinum",
    xp_reward: 1000,
    condition: "level >= 50"
  },
  level_100: {
    name: "Legend",
    description: "Reached level 100",
    tier: "legendary",
    xp_reward: 5000,
    condition: "level >= 100"
  },
  geography_master: {
    name: "Geography Master",
    description: "90%+ skill score in Geography",
    tier: "gold",
    xp_reward: 300,
    condition: "subject_mastery:Geography"
  },
  constitution_pro: {
    name: "Constitution Pro",
    description: "Mastered 100 constitution questions",
    tier: "gold",
    xp_reward: 300,
    condition: "constitution_questions >= 100"
  },
  mock_champion: {
    name: "Mock Champion",
    description: "Passed 5 mock exams",
    tier: "silver",
    xp_reward: 200,
    condition: "mock_passes >= 5"
  },
  ai_whisperer: {
    name: "AI Whisperer",
    description: "50+ helpful AI tutor chats",
    tier: "silver",
    xp_reward: 200,
    condition: "ai_helpful_count >= 50"
  },
  night_owl: {
    name: "Night Owl",
    description: "Studied after 10 PM for 30 days",
    tier: "silver",
    xp_reward: 250,
    condition: "night_study_days >= 30"
  },
  early_bird: {
    name: "Early Bird",
    description: "One of the first 1,000 users",
    tier: "bronze",
    xp_reward: 100,
    condition: "user_id <= 1000"
  },
  early_riser: {
    name: "Early Riser",
    description: "Studied before 6 AM for 7 days",
    tier: "bronze",
    xp_reward: 100,
    condition: "morning_study_days >= 7"
  },
  speed_demon: {
    name: "Speed Demon",
    description: "100 questions answered under 5 seconds each",
    tier: "silver",
    xp_reward: 200,
    condition: "fast_answers >= 100"
  },
  perfectionist: {
    name: "Perfectionist",
    description: "Achieved 100% in 10 quizzes",
    tier: "gold",
    xp_reward: 500,
    condition: "perfect_quizzes >= 10"
  }
};

export function calculateXPForAnswer(isCorrect: boolean, difficulty: number): number {
  if (!isCorrect) return XP_RULES.WRONG;
  switch (difficulty) {
    case 1: return XP_RULES.CORRECT_EASY;
    case 2: return XP_RULES.CORRECT_EASY;
    case 3: return XP_RULES.CORRECT_MEDIUM;
    case 4: return XP_RULES.CORRECT_HARD;
    case 5: return XP_RULES.CORRECT_HARD;
    default: return XP_RULES.CORRECT_MEDIUM;
  }
}

export function levelFromXP(totalXP: number): { level: number; xpInLevel: number; xpToNext: number; title: string } {
  const level = Math.floor(Math.sqrt(totalXP / 50)) + 1;
  const xpForCurrentLevel = 50 * Math.pow(level - 1, 2);
  const xpForNextLevel = 50 * Math.pow(level, 2);
  
  // Level titles
  const titles: Record<number, string> = {
    1: "Beginner",
    5: "Apprentice",
    10: "Scholar",
    15: "Specialist",
    20: "Expert",
    30: "Master",
    50: "Grandmaster",
    100: "Legend"
  };
  
  let title = "Beginner";
  const sortedLevels = Object.keys(titles).map(Number).sort((a, b) => a - b);
  for (const lvl of sortedLevels) {
    if (level >= lvl) title = titles[lvl]!;
  }
  
  return {
    level,
    xpInLevel: totalXP - xpForCurrentLevel,
    xpToNext: xpForNextLevel - totalXP,
    title
  };
}

export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string,
  description?: string
): Promise<UserXP> {
  if (amount <= 0) return getUserXP(userId);

  return withTransaction(async (client) => {
    // Get current
    const existing = await client.query<{ total_xp: number; level: number }>(
      `SELECT total_xp, level FROM user_xp WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );
    const currentTotal = existing.rows[0]?.total_xp ?? 0;
    const newTotal = currentTotal + amount;
    const levelInfo = levelFromXP(newTotal);
    const leveledUp = levelInfo.level > (existing.rows[0]?.level ?? 1);

    // Upsert XP
    const result = await client.query<UserXP>(
      `INSERT INTO user_xp (user_id, total_xp, level, xp_in_current_level, xp_to_next_level, title)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE
         SET total_xp = EXCLUDED.total_xp,
             level = EXCLUDED.level,
             xp_in_current_level = EXCLUDED.xp_in_current_level,
             xp_to_next_level = EXCLUDED.xp_to_next_level,
             title = EXCLUDED.title,
             updated_at = NOW()
       RETURNING *`,
      [userId, newTotal, levelInfo.level, levelInfo.xpInLevel, levelInfo.xpToNext, levelInfo.title]
    );

    // Log transaction
    await client.query(
      `INSERT INTO xp_transactions (user_id, amount, source, source_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, amount, source, sourceId ?? null, description ?? null]
    );

    // Update leaderboards (Redis sorted sets)
    const redis = getRedis();
    await redis.zadd("lb:xp:all_time", newTotal, userId);
    
    // Daily leaderboard with expiry
    const today = new Date().toISOString().split("T")[0]!;
    await redis.zadd(`lb:xp:daily:${today}`, amount, userId);
    await redis.expire(`lb:xp:daily:${today}`, 60 * 60 * 24 * 7); // 7 days
    
    // Weekly leaderboard
    const weekNumber = getWeekNumber(new Date());
    await redis.zadd(`lb:xp:weekly:${weekNumber}`, amount, userId);

    return result.rows[0]!;
  });
}

function getWeekNumber(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export async function getUserXP(userId: string): Promise<UserXP> {
  const result = await query<UserXP>(
    `SELECT user_id, total_xp, level, xp_in_current_level, xp_to_next_level FROM user_xp WHERE user_id = $1`,
    [userId]
  );
  if (result.rows[0]) return result.rows[0];
  return {
    user_id: userId,
    total_xp: 0,
    level: 1,
    xp_in_current_level: 0,
    xp_to_next_level: 50,
  };
}

// ============ Streaks ============
export async function recordActivity(userId: string, useFreeze: boolean = false): Promise<UserStreak> {
  const today = new Date().toISOString().split("T")[0]!;

  return withTransaction(async (client) => {
    const existing = await client.query<{
      current_streak: number;
      longest_streak: number;
      last_active_date: Date | null;
      streak_freezes_available: number;
    }>(
      `SELECT current_streak, longest_streak, last_active_date, streak_freezes_available
       FROM user_streaks WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    const current = existing.rows[0] ?? {
      current_streak: 0,
      longest_streak: 0,
      last_active_date: null,
      streak_freezes_available: 2,
    };

    let newStreak = current.current_streak;
    const lastDate = current.last_active_date ? new Date(current.last_active_date).toISOString().split("T")[0]! : null;
    let freezeUsed = false;

    if (lastDate === today) {
      // Already active today, no change
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]!;
      if (lastDate === yesterday) {
        newStreak += 1;
      } else if (lastDate && useFreeze && current.streak_freezes_available > 0 && newStreak >= 7) {
        // Streak freeze - only available for streaks of 7+ days
        const daysSinceActive = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
        if (daysSinceActive <= 2) { // Can only freeze for 1-2 day gap
          newStreak += 1; // Continue streak
          freezeUsed = true;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    const newLongest = Math.max(current.longest_streak, newStreak);
    const newFreezesAvailable = freezeUsed ? current.streak_freezes_available - 1 : current.streak_freezes_available;

    await client.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date, streak_freezes_available)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
         SET current_streak = EXCLUDED.current_streak,
             longest_streak = EXCLUDED.longest_streak,
             last_active_date = EXCLUDED.last_active_date,
             streak_freezes_available = EXCLUDED.streak_freezes_available,
             updated_at = NOW()`,
      [userId, newStreak, newLongest, today, newFreezesAvailable]
    );

    await client.query(
      `INSERT INTO streak_history (user_id, date, qualifying_activities, streak_at_that_day, freeze_used)
       VALUES ($1, $2, 1, $3, $4)
       ON CONFLICT (user_id, date) DO UPDATE
         SET qualifying_activities = streak_history.qualifying_activities + 1,
             freeze_used = streak_history.freeze_used OR EXCLUDED.freeze_used`,
      [userId, today, newStreak, freezeUsed]
    );

    // Check for streak milestones and award bonus XP
    const milestoneXP = getStreakMilestoneBonus(newStreak);
    if (milestoneXP > 0) {
      await client.query(
        `INSERT INTO xp_transactions (user_id, amount, source, source_id, description)
         VALUES ($1, $2, 'streak_milestone', NULL, $3)`,
        [userId, milestoneXP, `${newStreak}-day streak bonus`]
      );
      await client.query(
        `UPDATE user_xp SET total_xp = total_xp + $2, updated_at = NOW() WHERE user_id = $1`,
        [userId, milestoneXP]
      );
    }

    return {
      user_id: userId,
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active_date: today,
      streak_freezes_available: newFreezesAvailable,
    };
  });
}

function getStreakMilestoneBonus(streakDays: number): number {
  const milestones: Record<number, number> = {
    3: XP_RULES.STREAK_3,
    7: XP_RULES.STREAK_7,
    30: XP_RULES.STREAK_30,
    100: 1000,
    365: 5000
  };
  return milestones[streakDays] ?? 0;
}

export async function getUserStreak(userId: string): Promise<UserStreak> {
  const result = await query<UserStreak>(
    `SELECT * FROM user_streaks WHERE user_id = $1`,
    [userId]
  );
  return (
    result.rows[0] ?? {
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: undefined,
      streak_freezes_available: 2,
    }
  );
}

// ============ Badges ============
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  // Get user stats for badge evaluation
  const xp = await getUserXP(userId);
  const streak = await getUserStreak(userId);
  
  // Get additional stats
  const stats = await getUserBadgeStats(userId);

  for (const [badgeId, def] of Object.entries(BADGE_DEFINITIONS)) {
    if (await tryAwardBadgeByCondition(userId, badgeId, def, { xp, streak, ...stats })) {
      awarded.push(badgeId);
    }
  }

  return awarded;
}

async function getUserBadgeStats(userId: string) {
  const result = await query<{
    subject: string;
    avg_skill: number;
    questions_attempted: number;
    perfect_quizzes: number;
    fast_answers: number;
    mock_passes: number;
    ai_helpful_count: number;
    night_study_days: number;
    morning_study_days: number;
  }>(
    `SELECT 
      (SELECT topic FROM user_progress WHERE user_id = $1 ORDER BY skill_score DESC LIMIT 1) as subject,
      (SELECT AVG(skill_score) FROM user_progress WHERE user_id = $1) as avg_skill,
      (SELECT COUNT(*) FROM question_attempts WHERE user_id = $1) as questions_attempted,
      (SELECT COUNT(*) FROM mock_exam_attempts WHERE user_id = $1 AND is_passed = true) as mock_passes,
      (SELECT COUNT(*) FROM ai_messages WHERE user_id = $1 AND feedback = 'up') as ai_helpful_count,
      (SELECT COUNT(*) FROM streak_history WHERE user_id = $1 AND freeze_used = true) as freeze_usage
    `,
    [userId]
  );
  
  const row = result.rows[0] ?? {};
  return {
    subject: row.subject ?? "Unknown",
    questions_attempted: Number(row.questions_attempted ?? 0),
    mock_passes: Number(row.mock_passes ?? 0),
    ai_helpful_count: Number(row.ai_helpful_count ?? 0),
  };
}

async function tryAwardBadgeByCondition(
  userId: string, 
  badgeId: string, 
  def: any, 
  context: any
): Promise<boolean> {
  const condition = def.condition;
  let eligible = false;

  // Parse condition
  if (condition.startsWith("xp > ")) {
    eligible = context.xp.total_xp > parseInt(condition.split("> ")[1] ?? "0");
  } else if (condition.startsWith("current_streak >= ")) {
    eligible = context.streak.current_streak >= parseInt(condition.split(">= ")[1] ?? "0");
  } else if (condition.startsWith("level >= ")) {
    eligible = context.xp.level >= parseInt(condition.split(">= ")[1] ?? "0");
  } else if (condition.startsWith("subject_mastery:")) {
    const subject = condition.split(":")[1];
    eligible = context.subject === subject && context.questions_attempted >= 50;
  } else if (condition.startsWith("mock_passes >= ")) {
    eligible = context.mock_passes >= parseInt(condition.split(">= ")[1] ?? "0");
  } else if (condition.startsWith("ai_helpful_count >= ")) {
    eligible = context.ai_helpful_count >= parseInt(condition.split(">= ")[1] ?? "0");
  }
  // Add more conditions as needed

  if (!eligible) return false;
  return await tryAwardBadge(userId, badgeId);
}

async function tryAwardBadge(userId: string, badgeId: string): Promise<boolean> {
  const result = await withTransaction(async (client) => {
    // Insert badge
    const insertResult = await client.query(
      `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)
       ON CONFLICT (user_id, badge_id) DO NOTHING RETURNING badge_id`,
      [userId, badgeId]
    );
    
    const awarded = (insertResult.rowCount ?? 0) > 0;
    
    if (awarded) {
      // Award XP for the badge
      const def = BADGE_DEFINITIONS[badgeId];
      if (def?.xp_reward && def.xp_reward > 0) {
        await client.query(
          `UPDATE user_xp SET total_xp = total_xp + $2, updated_at = NOW() WHERE user_id = $1`,
          [userId, def.xp_reward]
        );
        await client.query(
          `INSERT INTO xp_transactions (user_id, amount, source, source_id, description)
           VALUES ($1, $2, 'badge_reward', $3, $4)`,
          [userId, def.xp_reward, badgeId, `Earned ${def.name} badge`]
        );
      }
    }
    
    return awarded;
  });
  
  return result;
}

export async function getUserBadges(userId: string) {
  const result = await query(
    `SELECT b.id, b.name, b.description, b.icon_url, b.category, b.tier, b.xp_reward, ub.earned_at 
     FROM badges b
     INNER JOIN user_badges ub ON ub.badge_id = b.id
     WHERE ub.user_id = $1
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getAvailableBadges(userId: string) {
  // Get all badge definitions
  const allBadges = Object.entries(BADGE_DEFINITIONS).map(([id, def]) => ({
    id,
    ...def
  }));
  
  // Get earned badges
  const earnedResult = await query<{ badge_id: string; earned_at: Date }>(
    `SELECT badge_id, earned_at FROM user_badges WHERE user_id = $1`,
    [userId]
  );
  const earnedMap = new Map(earnedResult.rows.map(r => [r.badge_id, r.earned_at]));
  
  // Mark earned vs available
  return allBadges.map(badge => ({
    ...badge,
    earned: earnedMap.has(badge.id),
    earned_at: earnedMap.get(badge.id) ?? null
  }));
}

// ============ Leaderboards ============
export async function getLeaderboard(
  scope: "national" | "district" | "subject" | "friends" | "institution" = "national",
  period: "daily" | "weekly" | "monthly" | "all_time" = "all_time",
  scopeValue?: string,
  limit: number = 100,
  currentUserId?: string
) {
  let key: string;
  switch (period) {
    case "daily":
      const today = new Date().toISOString().split("T")[0]!;
      key = `lb:${scope}:${scopeValue ?? "all"}:daily:${today}`;
      break;
    case "weekly":
      const weekNumber = getWeekNumber(new Date());
      key = `lb:${scope}:${scopeValue ?? "all"}:weekly:${weekNumber}`;
      break;
    case "monthly":
      const month = new Date().toISOString().slice(0, 7);
      key = `lb:${scope}:${scopeValue ?? "all"}:monthly:${month}`;
      break;
    default:
      key = `lb:${scope}:${scopeValue ?? "all"}:all_time`;
  }

  // Try Redis
  const cached = await getRedis().zrevrange(key, 0, limit - 1, "WITHSCORES");
  if (cached.length > 0) {
    const entries = [];
    for (let i = 0; i < cached.length; i += 2) {
      entries.push({
        rank: i / 2 + 1,
        user_id: cached[i]!,
        score: parseInt(cached[i + 1]!, 10),
      });
    }
    
    // Include current user's rank if not in top
    if (currentUserId && !entries.find(e => e.user_id === currentUserId)) {
      const userRank = await getRedis().zrevrank(key, currentUserId);
      if (userRank !== null) {
        const userScore = await getRedis().zscore(key, currentUserId);
        entries.push({
          rank: userRank + 1,
          user_id: currentUserId,
          score: parseInt(userScore ?? "0", 10),
          is_current_user: true
        });
      }
    }
    
    return entries;
  }

  // Fallback: DB query
  const result = await query<{ user_id: string; total_xp: number }>(
    `SELECT user_id, total_xp FROM user_xp
     ORDER BY total_xp DESC LIMIT $1`,
    [limit]
  );

  return result.rows.map((r, i) => ({
    rank: i + 1,
    user_id: r.user_id,
    score: r.total_xp,
  }));
}

// ============ Challenges ============
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special";
  goal: number;
  goal_type: "questions" | "xp" | "streak" | "topics_mastered" | "perfect_quizzes";
  reward_xp: number;
  reward_badge?: string;
  starts_at: Date;
  ends_at: Date;
}

export async function getActiveChallenges(userId: string): Promise<Challenge[]> {
  // In a full implementation, this would query a challenges table
  // For now, return default challenges
  return [
    {
      id: "daily_5_questions",
      title: "Daily Practice",
      description: "Answer 5 questions today",
      type: "daily",
      goal: 5,
      goal_type: "questions",
      reward_xp: 30,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      id: "weekly_streak_5",
      title: "5-Day Streak Challenge",
      description: "Maintain a 5-day streak this week",
      type: "weekly",
      goal: 5,
      goal_type: "streak",
      reward_xp: 100,
      reward_badge: "streak_7",
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];
}

// ============ Stats ============
export interface UserGamificationStats {
  xp: UserXP;
  streak: UserStreak;
  badge_count: number;
  global_rank?: number;
  weekly_xp: number;
}

export async function getUserStats(userId: string): Promise<UserGamificationStats> {
  const [xp, streak, badges] = await Promise.all([
    getUserXP(userId),
    getUserStreak(userId),
    getUserBadges(userId)
  ]);

  // Get weekly XP
  const weekNumber = getWeekNumber(new Date());
  const weeklyXPStr = await getRedis().zscore(`lb:xp:weekly:${weekNumber}`, userId);
  const weeklyXP = parseInt(weeklyXPStr ?? "0", 10);

  // Get global rank
  const allTimeRank = await getRedis().zrevrank("lb:xp:all_time", userId);

  return {
    xp,
    streak,
    badge_count: badges.length,
    global_rank: allTimeRank !== null ? allTimeRank + 1 : undefined,
    weekly_xp: weeklyXP
  };
}
