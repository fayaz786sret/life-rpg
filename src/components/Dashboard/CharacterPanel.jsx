import { motion } from 'framer-motion';
import { Flame, Zap, Coins, TrendingUp, BarChart2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { TASK_CATEGORIES, SHOP_ITEMS } from '../../lib/rpgSystem';

// Attribute colours used inline (Tailwind purge-safe)
const ATTR_GRADIENTS = {
  physical: 'from-red-500   to-red-400',
  mental:   'from-blue-500  to-blue-400',
  creative: 'from-purple-500 to-purple-400',
  social:   'from-green-500 to-green-400',
  health:   'from-pink-500  to-pink-400',
  skill:    'from-yellow-500 to-yellow-400',
};

export const CharacterPanel = () => {
  const { stats } = useGame();
  const { user }  = useAuth();

  const levelProgress = Math.round((stats.currentXP / stats.xpForNextLevel) * 100);
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Hero';
  const equippedBadge = stats.activeBadge
    ? SHOP_ITEMS.find(item => item.id === stats.activeBadge)
    : null;

  return (
    <aside className="space-y-4" aria-label="Character stats">
      {/* Character card */}
      <div className="card text-center">
        <motion.div
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-700
                     flex items-center justify-center text-4xl shadow-lg shadow-primary-900/40 mb-3"
          animate={{ boxShadow: ['0 0 10px rgba(247,160,23,0.4)', '0 0 24px rgba(247,160,23,0.7)', '0 0 10px rgba(247,160,23,0.4)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {stats.activeAvatar || '⚔️'}
        </motion.div>
        <h2 className="text-base font-semibold capitalize">{username}</h2>
        <p className="text-primary-400 text-xs mt-0.5">Level {stats.level} Hero</p>
        {equippedBadge && (
          <p className="text-xs text-yellow-300 mt-1">
            {equippedBadge.icon} {equippedBadge.name}
          </p>
        )}

        {/* XP bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-purple-400" /> XP</span>
            <span>{stats.currentXP} / {stats.xpForNextLevel}</span>
          </div>
          <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              aria-label={`${levelProgress}% XP progress to next level`}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">
            {stats.xpForNextLevel - stats.currentXP} XP to level {stats.level + 1}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Flame className="w-4 h-4" />, label: 'Streak',  value: `${stats.streak}d`,       color: 'text-orange-300 bg-orange-900/30' },
          { icon: <Coins className="w-4 h-4" />, label: 'Gold',    value: stats.gold,                color: 'text-primary-300 bg-primary-900/30' },
          { icon: <TrendingUp className="w-4 h-4" />, label: 'Total XP', value: stats.totalXP,       color: 'text-purple-300 bg-purple-900/30' },
          { icon: <BarChart2 className="w-4 h-4" />, label: 'Quests',   value: stats.tasksCompleted, color: 'text-blue-300 bg-blue-900/30' },
        ].map(s => (
          <div key={s.label} className={`card p-3 text-center ${s.color} border-0`}>
            <div className="flex justify-center mb-1">{s.icon}</div>
            <div className="font-bold text-lg">{s.value}</div>
            <div className="text-xs opacity-70 font-body">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Attributes */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary-400" />
          Attributes
        </h3>
        <div className="space-y-2.5">
          {Object.entries(stats.attributes).map(([key, val]) => {
            const cat = TASK_CATEGORIES[key];
            if (!cat) return null;
            const pct = Math.min((val / 20) * 100, 100);
            return (
              <div key={key}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    <span role="img" aria-hidden="true">{cat.icon}</span>
                    <span className="text-gray-300">{cat.name}</span>
                  </span>
                  <span className="text-primary-400 font-bold">Lv {val}</span>
                </div>
                <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${ATTR_GRADIENTS[key]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory badge */}
      {stats.inventory.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">🎒 Inventory</h3>
          <div className="flex flex-wrap gap-2">
            {stats.inventory.map(id => (
              <span key={id} className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-300 border border-dark-600">
                {id.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
