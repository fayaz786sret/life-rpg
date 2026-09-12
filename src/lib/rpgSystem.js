// RPG Progression System - All game logic calculations

// Non-linear XP formula: XP needed = baseXP * (level^1.5)
export const calculateXPForLevel = (level) => {
  const baseXP = 100;
  return Math.floor(baseXP * Math.pow(level, 1.5));
};

// Calculate what level a user should be based on total XP
export const calculateLevelFromXP = (totalXP) => {
  let level = 1;
  let xpNeeded = 0;
  
  while (totalXP >= xpNeeded) {
    xpNeeded += calculateXPForLevel(level);
    if (totalXP >= xpNeeded) {
      level++;
    }
  }
  
  const xpForCurrentLevel = xpNeeded - calculateXPForLevel(level - 1);
  const currentLevelXP = totalXP - (xpNeeded - calculateXPForLevel(level));
  
  return {
    level,
    currentXP: currentLevelXP,
    xpForNextLevel: calculateXPForLevel(level),
    totalXP,
  };
};

// Task difficulty multipliers
export const DIFFICULTY_MULTIPLIERS = {
  trivial: 0.5,
  easy: 1,
  medium: 1.5,
  hard: 2,
  epic: 3,
};

// Attribute categories mapping
export const TASK_CATEGORIES = {
  physical: { name: 'Strength', icon: '💪', color: 'red' },
  mental: { name: 'Intellect', icon: '🧠', color: 'blue' },
  creative: { name: 'Creativity', icon: '🎨', color: 'purple' },
  social: { name: 'Charisma', icon: '🤝', color: 'green' },
  health: { name: 'Vitality', icon: '❤️', color: 'pink' },
  skill: { name: 'Dexterity', icon: '🎯', color: 'yellow' },
};

// Calculate XP reward for completing a task
export const calculateTaskXP = (difficulty = 'easy', isStreakBonus = false) => {
  const baseXP = 50;
  const xp = Math.floor(baseXP * DIFFICULTY_MULTIPLIERS[difficulty]);
  const streakBonus = isStreakBonus ? Math.floor(xp * 0.2) : 0;
  return xp + streakBonus;
};

// Calculate gold (currency) reward
export const calculateGoldReward = (difficulty = 'easy') => {
  const baseGold = 10;
  return Math.floor(baseGold * DIFFICULTY_MULTIPLIERS[difficulty]);
};

// Check if streak is maintained (completed a task today)
export const checkStreak = (lastCompletionDate) => {
  if (!lastCompletionDate) return { streak: 0, isActive: false };
  
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastDate = new Date(lastCompletionDate).toDateString();
  
  if (lastDate === today) {
    return { isActive: true, isSameDay: true };
  }
  
  if (lastDate === yesterday) {
    return { isActive: true, isSameDay: false };
  }
  
  return { isActive: false, isSameDay: false };
};

// Shop items available for purchase
export const SHOP_ITEMS = [
  {
    id: 'theme_midnight',
    name: 'Midnight Theme',
    description: 'A dark, mysterious color scheme',
    price: 500,
    type: 'theme',
    icon: '🌙',
    themeValue: 'midnight',
  },
  {
    id: 'theme_sunrise',
    name: 'Sunrise Theme',
    description: 'Warm and energetic sunset colors',
    price: 500,
    type: 'theme',
    icon: '🌅',
    themeValue: 'sunrise',
  },
  {
    id: 'theme_cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Electric neon cyan & blue futuristic theme',
    price: 600,
    type: 'theme',
    icon: '⚡',
    themeValue: 'cyberpunk',
  },
  {
    id: 'theme_retro',
    name: '16-Bit Retro',
    description: 'Classic arcade synthwave vibes',
    price: 600,
    type: 'theme',
    icon: '👾',
    themeValue: 'retro',
  },
  {
    id: 'badge_warrior',
    name: 'Warrior Badge',
    description: 'For the dedicated fighter',
    price: 300,
    type: 'badge',
    icon: '⚔️',
  },
  {
    id: 'badge_scholar',
    name: 'Scholar Badge',
    description: 'For the knowledge seeker',
    price: 300,
    type: 'badge',
    icon: '📚',
  },
  {
    id: 'badge_master',
    name: 'Master Badge',
    description: 'For the ultimate achiever',
    price: 1000,
    type: 'badge',
    icon: '👑',
  },
  {
    id: 'avatar_knight',
    name: 'Knight Avatar',
    description: 'Valiant and brave hero',
    price: 750,
    type: 'avatar',
    icon: '🛡️',
  },
  {
    id: 'avatar_wizard',
    name: 'Wizard Avatar',
    description: 'Wise and magical sorcerer',
    price: 750,
    type: 'avatar',
    icon: '🧙',
  },
  {
    id: 'avatar_dragon',
    name: 'Dragon Slayer',
    description: 'Legendary mythical beast',
    price: 900,
    type: 'avatar',
    icon: '🐉',
  },
  {
    id: 'avatar_ninja',
    name: 'Cyber Ninja',
    description: 'Master of stealth and speed',
    price: 900,
    type: 'avatar',
    icon: '🥷',
  },
];

// Achievement system
export const ACHIEVEMENTS = [
  {
    id: 'first_task',
    name: 'First Steps',
    description: 'Complete your first quest',
    requirement: (stats) => stats.tasksCompleted >= 1,
    xpReward: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    requirement: (stats) => stats.streak >= 7,
    xpReward: 200,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    requirement: (stats) => stats.level >= 10,
    xpReward: 500,
  },
  {
    id: 'tasks_50',
    name: 'Quest Master',
    description: 'Complete 50 quests',
    requirement: (stats) => stats.tasksCompleted >= 50,
    xpReward: 1000,
  },
];
