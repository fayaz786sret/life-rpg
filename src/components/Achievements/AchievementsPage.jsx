import { motion } from 'framer-motion';
import { Trophy, Lock, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ACHIEVEMENTS } from '../../lib/rpgSystem';

const AchievementCard = ({ achievement, unlocked }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -3 }}
    className={`relative bg-dark-800/80 border rounded-xl p-5 transition-all overflow-hidden
      ${unlocked
        ? 'border-primary-500/60 shadow-lg shadow-primary-900/30'
        : 'border-dark-600 opacity-60 grayscale'}`}
  >
    {unlocked && (
      <motion.div
        className="absolute top-2 right-2 w-2 h-2 bg-primary-400 rounded-full"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}

    <div className="flex items-start gap-4">
      <div className={`text-4xl p-2 rounded-xl ${unlocked ? 'bg-primary-900/30' : 'bg-dark-700'}`}>
        {unlocked ? achievement.icon || '🏆' : <Lock className="w-7 h-7 text-gray-600" />}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-base">{achievement.name}</h3>
        <p className="text-gray-400 text-sm mt-0.5">{achievement.description}</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-300 font-medium">
          <Zap className="w-3 h-3" />
          <span>+{achievement.xpReward} XP reward</span>
        </div>
      </div>
    </div>

    {unlocked && (
      <div className="mt-3 pt-3 border-t border-dark-600 text-xs text-green-400 flex items-center gap-1 font-medium">
        ✅ Unlocked!
      </div>
    )}
  </motion.div>
);

// Icons map (achievements defined in rpgSystem don't have icons, add them here)
const ICONS = {
  first_task:  '🌟',
  streak_7:    '🔥',
  level_10:    '🏅',
  tasks_50:    '👑',
};

export const AchievementsPage = () => {
  const { stats } = useGame();

  const achievementsWithStatus = ACHIEVEMENTS.map(a => ({
    ...a,
    icon: ICONS[a.id] || '🏆',
    unlocked: a.requirement(stats),
  }));

  const unlocked = achievementsWithStatus.filter(a => a.unlocked).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl flex items-center gap-3">
            <Trophy className="w-7 h-7 text-primary-400" />
            Achievements
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-body">
            Track your legendary accomplishments
          </p>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 px-4 py-2 rounded-lg text-sm">
          <Trophy className="w-4 h-4 text-primary-400" />
          <span className="font-bold text-primary-300">{unlocked}</span>
          <span className="text-gray-400">/ {ACHIEVEMENTS.length} unlocked</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-300">Overall Progress</span>
          <span className="text-primary-400 font-bold">
            {Math.round((unlocked / ACHIEVEMENTS.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievementsWithStatus.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <AchievementCard achievement={a} unlocked={a.unlocked} />
          </motion.div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Quests Done',  value: stats.tasksCompleted,  icon: '⚔️' },
          { label: 'Day Streak',   value: stats.streak,           icon: '🔥' },
          { label: 'Hero Level',   value: stats.level,            icon: '⬆️' },
          { label: 'Total XP',     value: stats.totalXP,          icon: '⚡' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-primary-400">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1 font-body">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
