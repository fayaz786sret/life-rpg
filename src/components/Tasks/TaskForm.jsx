import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Swords, Zap, Star } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TASK_CATEGORIES, DIFFICULTY_MULTIPLIERS, calculateTaskXP, calculateGoldReward } from '../../lib/rpgSystem';

const DIFFICULTIES = [
  { value: 'trivial', label: 'Trivial', color: 'text-gray-400', icon: '🌱' },
  { value: 'easy',    label: 'Easy',    color: 'text-green-400', icon: '⚔️' },
  { value: 'medium',  label: 'Medium',  color: 'text-yellow-400', icon: '🗡️' },
  { value: 'hard',    label: 'Hard',    color: 'text-orange-400', icon: '🔥' },
  { value: 'epic',    label: 'Epic',    color: 'text-purple-400', icon: '💀' },
];

export const TaskForm = () => {
  const { addTask } = useGame();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('mental');
  const [error, setError] = useState('');

  const previewXP   = calculateTaskXP(difficulty);
  const previewGold = calculateGoldReward(difficulty);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quest name cannot be empty!');
      return;
    }
    addTask({ title: title.trim(), description: description.trim(), difficulty, category });
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setCategory('mental');
    setError('');
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2 w-full sm:w-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Add new quest"
      >
        <Plus className="w-5 h-5" />
        New Quest
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-lg card z-10"
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg flex items-center gap-2">
                  <Swords className="w-5 h-5 text-primary-400" />
                  Create Quest
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="task-title" className="block text-sm font-medium mb-1 text-gray-300">
                    Quest Name *
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(''); }}
                    className="input-field"
                    placeholder="e.g. Read for 30 minutes"
                    maxLength={100}
                    autoFocus
                    aria-required="true"
                  />
                  {error && (
                    <p className="text-red-400 text-xs mt-1" role="alert">{error}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="task-desc" className="block text-sm font-medium mb-1 text-gray-300">
                    Description <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    id="task-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field resize-none"
                    placeholder="Describe your quest..."
                    rows={2}
                    maxLength={300}
                  />
                </div>

                {/* Category */}
                <div>
                  <span className="block text-sm font-medium mb-2 text-gray-300">Category</span>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Quest category">
                    {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        role="radio"
                        aria-checked={category === key}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all
                          ${category === key
                            ? 'border-primary-500 bg-primary-900/30 text-primary-300'
                            : 'border-dark-600 bg-dark-700/50 text-gray-400 hover:border-dark-500'
                          }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <span className="block text-sm font-medium mb-2 text-gray-300">Difficulty</span>
                  <div className="grid grid-cols-5 gap-1" role="radiogroup" aria-label="Quest difficulty">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDifficulty(d.value)}
                        role="radio"
                        aria-checked={difficulty === d.value}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all
                          ${difficulty === d.value
                            ? 'border-primary-500 bg-primary-900/30'
                            : 'border-dark-600 bg-dark-700/50 hover:border-dark-500'
                          }`}
                      >
                        <span className="text-lg">{d.icon}</span>
                        <span className={d.color}>{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reward preview */}
                <div className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-lg text-sm">
                  <span className="text-gray-400">Rewards:</span>
                  <span className="flex items-center gap-1 text-purple-300 font-bold">
                    <Zap className="w-4 h-4" /> +{previewXP} XP
                  </span>
                  <span className="flex items-center gap-1 text-primary-300 font-bold">
                    <Star className="w-4 h-4" /> +{previewGold} Gold
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    ⚔️ Accept Quest
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
