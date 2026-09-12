import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Particle component for the celebration effect
const Particle = ({ index }) => {
  const colors = ['#f7a017', '#a855f7', '#22c55e', '#3b82f6', '#ef4444'];
  const color  = colors[index % colors.length];
  const x      = (Math.random() - 0.5) * 400;
  const y      = (Math.random() - 0.5) * 400;
  const rotate = Math.random() * 360;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm pointer-events-none"
      style={{ backgroundColor: color, top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ x, y, opacity: 0, rotate, scale: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    />
  );
};

export const LevelUpModal = ({ level, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 24 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Card */}
      <motion.div
        className="relative text-center px-10 py-8 bg-dark-800/95 border-2 border-primary-500 rounded-2xl shadow-2xl"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        role="alert"
        aria-live="assertive"
        aria-label={`Level up! You reached level ${level}`}
      >
        <motion.div
          className="text-7xl mb-3"
          animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8 }}
        >
          ⬆️
        </motion.div>
        <p className="text-primary-400 text-xs mb-1 tracking-widest uppercase">
          Level Up!
        </p>
        <motion.h2
          className="text-4xl text-white mb-2"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Level {level}
        </motion.h2>
        <p className="text-gray-400 text-sm">You are growing stronger, Hero!</p>

        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary-400 pointer-events-none"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};


// Floating XP / Gold toast notification
export const RewardToast = ({ reward, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2 pointer-events-none"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 bg-purple-900/90 border border-purple-500 text-purple-200 px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
        ⚡ +{reward.xpGain} XP
      </div>
      <div className="flex items-center gap-2 bg-primary-900/90 border border-primary-500 text-primary-200 px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
        ⭐ +{reward.goldGain} Gold
      </div>
      {reward.streakBonus && (
        <div className="flex items-center gap-2 bg-orange-900/90 border border-orange-500 text-orange-200 px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
          🔥 Streak Bonus!
        </div>
      )}
    </motion.div>
  );
};
