import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TASK_CATEGORIES } from '../../lib/rpgSystem';

export const StatsPanel = () => {
  const { stats } = useGame();

  return (
    <div className="card">
      <h3 className="text-xl mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-400" />
        Character Attributes
      </h3>
      
      <div className="space-y-3">
        {Object.entries(stats.attributes).map(([key, value]) => {
          const category = TASK_CATEGORIES[key];
          if (!category) return null;
          
          const progressPercent = Math.min((value / 20) * 100, 100);
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-700/50 p-3 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={category.name}>
                    {category.icon}
                  </span>
                  <span className="font-semibold text-sm">{category.name}</span>
                </div>
                <span className="text-primary-400 font-bold">Lv {value}</span>
              </div>
              
              <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${category.color}-500 to-${category.color}-400`}
                  style={{
                    background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          💡 <strong>Tip:</strong> Complete quests in different categories to level up your attributes!
        </p>
      </div>
    </div>
  );
};
