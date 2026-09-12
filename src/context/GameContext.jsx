import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  calculateLevelFromXP,
  calculateTaskXP,
  calculateGoldReward,
  checkStreak,
  TASK_CATEGORIES,
} from '../lib/rpgSystem';

const GameContext = createContext({});

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

/* ── Default character state ─────────────────────────── */
const INITIAL_STATS = {
  totalXP: 0, gold: 100, level: 1, currentXP: 0, xpForNextLevel: 100,
  streak: 0, lastCompletionDate: null, tasksCompleted: 0,
  attributes: { physical: 1, mental: 1, creative: 1, social: 1, health: 1, skill: 1 },
  inventory: [],
  activeTheme: 'midnight',
  activeAvatar: '⚔️',
  activeBadge: null,
};

const withoutUnsupportedProfileFields = (patch, message = '') => {
  const normalized = String(message).toLowerCase();
  const next = { ...patch };

  if (normalized.includes('active_badge')) delete next.active_badge;
  if (normalized.includes('active_avatar')) delete next.active_avatar;
  if (normalized.includes('active_theme')) delete next.active_theme;

  return next;
};

/* ── Helper: upsert profile row ──────────────────────── */
const upsertProfile = async (userId, patch) => {
  if (userId.startsWith('demo-hero')) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() });

  if (!error) return;

  const retryPatch = withoutUnsupportedProfileFields(patch, error.message);
  const hasRetriableFieldDrop = Object.keys(retryPatch).length !== Object.keys(patch).length;

  if (!hasRetriableFieldDrop) {
    throw new Error(`upsertProfile: ${error.message}`);
  }

  const { error: retryError } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...retryPatch, updated_at: new Date().toISOString() });

  if (retryError) {
    throw new Error(`upsertProfile retry: ${retryError.message}`);
  }
};

/* ── Helper: upsert attributes row ──────────────────── */
const upsertAttributes = async (userId, attrs) => {
  if (userId.startsWith('demo-hero')) return;
  const { error } = await supabase
    .from('attributes')
    .upsert({ user_id: userId, ...attrs, updated_at: new Date().toISOString() });
  if (error) throw new Error(`upsertAttributes: ${error.message}`);
};

export const GameProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(INITIAL_STATS);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── Load all data from Supabase on login ─────────── */
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (user.isDemo) {
      // Demo mode persistence via localStorage
      const stored = localStorage.getItem('life_rpg_demo_stats');
      const storedTasks = localStorage.getItem('life_rpg_demo_tasks');
      if (stored) {
        setStats(JSON.parse(stored));
      } else {
        const defaultDemoStats = {
          ...INITIAL_STATS,
          gold: 250,
          inventory: ['theme_midnight'],
        };
        setStats(defaultDemoStats);
        localStorage.setItem('life_rpg_demo_stats', JSON.stringify(defaultDemoStats));
      }

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        const sampleTasks = [
          { id: 'demo-1', title: 'Complete Morning Workout 🏋️', description: '30 mins of cardio & core exercise', difficulty: 'medium', category: 'physical', completed: false, createdAt: new Date().toISOString() },
          { id: 'demo-2', title: 'Study TypeScript & React 💻', description: 'Read 2 chapters of design patterns', difficulty: 'hard', category: 'mental', completed: false, createdAt: new Date().toISOString() },
          { id: 'demo-3', title: 'Meditation & Hydration 🧘', description: '10 min mindfulness session', difficulty: 'easy', category: 'health', completed: false, createdAt: new Date().toISOString() },
        ];
        setTasks(sampleTasks);
        localStorage.setItem('life_rpg_demo_tasks', JSON.stringify(sampleTasks));
      }
      setLoading(false);
      return;
    }

    // 1. Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Attributes
    const { data: attrs } = await supabase
      .from('attributes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 3. Tasks
    const { data: taskRows } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    // 4. Inventory
    const { data: invRows } = await supabase
      .from('inventory')
      .select('item_id')
      .eq('user_id', user.id);

    if (profile) {
      const levelInfo = calculateLevelFromXP(profile.total_xp ?? 0);
      setStats({
        totalXP:             profile.total_xp         ?? 0,
        gold:                profile.gold              ?? 100,
        level:               levelInfo.level,
        currentXP:           levelInfo.currentXP,
        xpForNextLevel:      levelInfo.xpForNextLevel,
        streak:              profile.streak            ?? 0,
        lastCompletionDate:  profile.last_completion_date ?? null,
        tasksCompleted:      profile.tasks_completed   ?? 0,
        attributes: attrs ? {
          physical: attrs.physical ?? 1,
          mental:   attrs.mental   ?? 1,
          creative: attrs.creative ?? 1,
          social:   attrs.social   ?? 1,
          health:   attrs.health   ?? 1,
          skill:    attrs.skill    ?? 1,
        } : INITIAL_STATS.attributes,
        inventory: invRows ? invRows.map(r => r.item_id) : [],
        activeTheme: profile.active_theme || 'midnight',
        activeAvatar: profile.active_avatar || '⚔️',
        activeBadge: profile.active_badge || null,
      });
    } else {
      // First login — create profile row
      const username =
        user.user_metadata?.username ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] || 'Hero';

      try {
        await upsertProfile(user.id, {
          username,
          total_xp: 0,
          level: 1,
          gold: 100,
          streak: 0,
          tasks_completed: 0,
          active_theme: 'midnight',
          active_avatar: '⚔️',
          active_badge: null,
        });
      } catch (profileError) {
        console.error('create profile fallback:', profileError.message);
      }

      const { error: attrsError } = await supabase.from('attributes').upsert({ user_id: user.id });
      if (attrsError) {
        console.error('create attributes fallback:', attrsError.message);
      }
      setStats(INITIAL_STATS);
    }

    // Normalise task rows → camelCase for components
    setTasks(
      (taskRows || []).map(t => ({
        id:          t.id,
        title:       t.title,
        description: t.description,
        difficulty:  t.difficulty,
        category:    t.category,
        completed:   t.completed,
        completedAt: t.completed_at,
        createdAt:   t.created_at,
        xpEarned:    t.xp_earned,
        goldEarned:  t.gold_earned,
      }))
    );

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Apply theme to document body whenever activeTheme changes
  useEffect(() => {
    if (stats.activeTheme) {
      document.body.setAttribute('data-theme', stats.activeTheme);
    }
  }, [stats.activeTheme]);

  /* ── Add task ────────────────────────────────────── */
  const addTask = async (task) => {
    const tempId = `task_${Date.now()}`;
    const optimistic = {
      id: tempId, ...task, completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => {
      const next = [...prev, optimistic];
      if (user?.isDemo) localStorage.setItem('life_rpg_demo_tasks', JSON.stringify(next));
      return next;
    });

    if (user?.isDemo) return optimistic;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id:     user.id,
        title:       task.title,
        description: task.description || null,
        difficulty:  task.difficulty,
        category:    task.category,
      })
      .select()
      .single();

    if (error) {
      console.error('addTask:', error.message);
      setTasks(prev => prev.filter(t => t.id !== tempId));
      return null;
    }

    setTasks(prev => prev.map(t =>
      t.id === tempId
        ? { id: data.id, title: data.title, description: data.description,
            difficulty: data.difficulty, category: data.category,
            completed: data.completed, createdAt: data.created_at }
        : t
    ));
    return data;
  };

  /* ── Complete task ───────────────────────────────── */
  const completeTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return null;

    const streakInfo = checkStreak(stats.lastCompletionDate);
    const newStreak  = streakInfo.isSameDay ? stats.streak
                     : streakInfo.isActive  ? stats.streak + 1
                     : 1;

    const xpGain   = calculateTaskXP(task.difficulty, newStreak > 1);
    const goldGain = calculateGoldReward(task.difficulty);
    const newTotalXP = stats.totalXP + xpGain;
    const levelInfo  = calculateLevelFromXP(newTotalXP);
    const didLevelUp = levelInfo.level > stats.level;

    const newAttributes = { ...stats.attributes };
    if (task.category && TASK_CATEGORIES[task.category]) {
      newAttributes[task.category] = (newAttributes[task.category] || 1) + 1;
    }

    const newStats = {
      ...stats,
      totalXP:            newTotalXP,
      level:              levelInfo.level,
      currentXP:          levelInfo.currentXP,
      xpForNextLevel:     levelInfo.xpForNextLevel,
      gold:               stats.gold + goldGain,
      streak:             newStreak,
      lastCompletionDate: new Date().toISOString(),
      tasksCompleted:     stats.tasksCompleted + 1,
      attributes:         newAttributes,
    };

    // Optimistic UI
    setStats(newStats);
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === taskId
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      );
      if (user?.isDemo) {
        localStorage.setItem('life_rpg_demo_stats', JSON.stringify(newStats));
        localStorage.setItem('life_rpg_demo_tasks', JSON.stringify(next));
      }
      return next;
    });

    if (user?.isDemo) {
      return { xpGain, goldGain, didLevelUp, newLevel: levelInfo.level, streakBonus: newStreak > 1, newStreak };
    }

    // Persist to Supabase
    try {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          xp_earned: xpGain,
          gold_earned: goldGain,
        })
        .eq('id', taskId);

      if (taskError) throw new Error(`completeTask task update: ${taskError.message}`);

      await Promise.all([
        upsertProfile(user.id, {
          total_xp: newTotalXP,
          level: levelInfo.level,
          gold: newStats.gold,
          streak: newStreak,
          last_completion_date: newStats.lastCompletionDate,
          tasks_completed: newStats.tasksCompleted,
        }),
        upsertAttributes(user.id, newAttributes),
      ]);
    } catch (error) {
      console.error(error.message);
      await loadData();
      return null;
    }

    return { xpGain, goldGain, didLevelUp, newLevel: levelInfo.level, streakBonus: newStreak > 1, newStreak };
  };

  /* ── Delete task ─────────────────────────────────── */
  const deleteTask = async (taskId) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== taskId);
      if (user?.isDemo) localStorage.setItem('life_rpg_demo_tasks', JSON.stringify(next));
      return next;
    });
    if (!user?.isDemo) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) { console.error('deleteTask:', error.message); await loadData(); }
    }
  };

  /* ── Update task ─────────────────────────────────── */
  const updateTask = async (taskId, updates) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, ...updates } : t);
      if (user?.isDemo) localStorage.setItem('life_rpg_demo_tasks', JSON.stringify(next));
      return next;
    });
    if (user?.isDemo) {
      return { success: true, message: 'Quest updated.' };
    }

    const dbUpdates = {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.description !== undefined ? { description: updates.description || null } : {}),
      ...(updates.difficulty !== undefined ? { difficulty: updates.difficulty } : {}),
      ...(updates.category !== undefined ? { category: updates.category } : {}),
    };

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
    if (error) {
      console.error('updateTask:', error.message);
      await loadData();
      return { success: false, message: 'Failed to update quest. Please try again.' };
    }
    return { success: true, message: 'Quest updated.' };
  };

  /* ── Purchase item ───────────────────────────────── */
  const purchaseItem = async (item) => {
    if (stats.gold < item.price) return { success: false, message: 'Not enough gold!' };
    if (stats.inventory.includes(item.id)) return { success: false, message: 'You already own this item.' };

    const previousStats = stats;
    const newGold = stats.gold - item.price;
    const newInventory = [...stats.inventory, item.id];

    // Optimistic update
    setStats(prev => {
      const next = { ...prev, gold: newGold, inventory: newInventory };
      if (user?.isDemo) localStorage.setItem('life_rpg_demo_stats', JSON.stringify(next));
      return next;
    });

    if (user?.isDemo) {
      return { success: true, message: `Purchased ${item.name}!` };
    }

    const { error: invErr } = await supabase
      .from('inventory')
      .insert({ user_id: user.id, item_id: item.id });

    if (invErr && invErr.code !== '23505') {
      console.error('purchaseItem inventory:', invErr.message);
      setStats(previousStats);
      return { success: false, message: 'Purchase failed. Try again.' };
    }

    try {
      await upsertProfile(user.id, { gold: newGold });
    } catch (error) {
      console.error(error.message);
      setStats(previousStats);
      return { success: false, message: 'Purchase saved locally but failed to sync. Please retry.' };
    }
    return { success: true, message: `Purchased ${item.name}!` };
  };

  /* ── Equip item (theme / avatar) ─────────────────── */
  const equipItem = async (item) => {
    if (!stats.inventory.includes(item.id)) return { success: false, message: 'Item not owned!' };

    let patch = null;
    if (item.type === 'theme') {
      const themeVal = item.themeValue || 'midnight';
      patch = { activeTheme: themeVal, active_theme: themeVal };
    }

    if (item.type === 'avatar') {
      patch = { activeAvatar: item.icon, active_avatar: item.icon };
    }

    if (item.type === 'badge') {
      patch = { activeBadge: item.id, active_badge: item.id };
    }

    if (!patch) return { success: false, message: 'This item cannot be equipped.' };

    const previousStats = stats;
    setStats(prev => {
      const next = {
        ...prev,
        ...(patch.activeTheme ? { activeTheme: patch.activeTheme } : {}),
        ...(patch.activeAvatar ? { activeAvatar: patch.activeAvatar } : {}),
        ...(patch.activeBadge !== undefined ? { activeBadge: patch.activeBadge } : {}),
      };
      if (user?.isDemo) localStorage.setItem('life_rpg_demo_stats', JSON.stringify(next));
      return next;
    });

    if (user?.isDemo) return { success: true, message: `Equipped ${item.name}!` };

    try {
      await upsertProfile(user.id, {
        ...(patch.active_theme ? { active_theme: patch.active_theme } : {}),
        ...(patch.active_avatar ? { active_avatar: patch.active_avatar } : {}),
        ...(patch.active_badge !== undefined ? { active_badge: patch.active_badge } : {}),
      });
      return { success: true, message: `Equipped ${item.name}!` };
    } catch (error) {
      console.error(error.message);
      setStats(previousStats);
      return { success: false, message: 'Failed to equip item. Please retry.' };
    }
  };

  return (
    <GameContext.Provider value={{
      stats, tasks, loading, addTask, completeTask,
      deleteTask, updateTask, purchaseItem, equipItem
    }}>
      {children}
    </GameContext.Provider>
  );
};
