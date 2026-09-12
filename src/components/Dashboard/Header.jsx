import { motion } from 'framer-motion';
import { LogOut, Flame, Trophy, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { stats } = useGame();

  const handleSignOut = async () => {
    await signOut();
  };

  // Progress percentage for level
  const levelProgress = (stats.currentXP / stats.xpForNextLevel) * 100;

  return (
    <header className="bg-dark-800/90 backdrop-blur-sm border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Character Info */}
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl animate-float"
              whileHover={{ scale: 1.1 }}
            >
              {stats.activeAvatar || '⚔️'}
            </motion.div>
            <div>
              <h2 className="font-semibold text-lg">
                {user?.user_metadata?.username || user?.username || user?.email?.split('@')[0] || 'Hero'}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary-400 font-bold">Lvl {stats.level}</span>
                <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-gray-400 text-xs">
                  {stats.currentXP}/{stats.xpForNextLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="stat-badge bg-orange-900/30 text-orange-300">
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span className="font-bold">{stats.streak}</span>
              <span className="hidden sm:inline">day streak</span>
              <span className="sr-only">{stats.streak} day streak</span>
            </div>
            
            <div className="stat-badge bg-primary-900/30 text-primary-300">
              <Coins className="w-4 h-4" aria-hidden="true" />
              <span className="font-bold">{stats.gold}</span>
              <span className="hidden sm:inline">gold</span>
              <span className="sr-only">{stats.gold} gold</span>
            </div>
            
            <div className="stat-badge bg-purple-900/30 text-purple-300">
              <Trophy className="w-4 h-4" aria-hidden="true" />
              <span className="font-bold">{stats.tasksCompleted}</span>
              <span className="hidden sm:inline">quests</span>
              <span className="sr-only">{stats.tasksCompleted} quests completed</span>
            </div>
          </div>

          {/* Right: Sign Out */}
          <motion.button
            onClick={handleSignOut}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
