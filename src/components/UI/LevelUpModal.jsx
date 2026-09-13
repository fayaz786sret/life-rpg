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
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 32 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Modal Card */}
      <motion.div
        className="relative text-center px-10 py-9 rounded-2xl shadow-2xl z-10 max-w-sm w-full cursor-pointer"
        onClick={onClose}
        style={{
          backgroundColor: '#191a27',
          border: '2px solid #f7a017',
          boxShadow: '0 0 35px rgba(247, 160, 23, 0.4), 0 20px 40px rgba(0,0,0,0.8)',
        }}
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        role="alert"
        aria-live="assertive"
        aria-label={`Level up! You reached level ${level}`}
      >
        {/* Blue square icon wrapper matching screenshot */}
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="text-4xl text-white">⬆️</span>
        </motion.div>

        <p className="text-xs font-bold mb-2 tracking-widest uppercase" style={{ color: '#f7a017' }}>
          LEVEL UP!
        </p>

        <motion.h2
          className="text-3xl md:text-4xl mb-3 text-white"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Level {level}
        </motion.h2>

        <p className="text-gray-300 text-sm font-medium">You are growing stronger, Hero!</p>

        {/* Glow border ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
          style={{ borderColor: '#f9b851' }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
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
