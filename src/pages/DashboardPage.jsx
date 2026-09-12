import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '../components/Dashboard/Header';
import { CharacterPanel } from '../components/Dashboard/CharacterPanel';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskList } from '../components/Tasks/TaskList';
import { ShopPage } from '../components/Shop/ShopPage';
import { AchievementsPage } from '../components/Achievements/AchievementsPage';
import { LevelUpModal, RewardToast } from '../components/UI/LevelUpModal';
import { Swords, ShoppingBag, Trophy } from 'lucide-react';

const NAV = [
  { id: 'quests',       label: 'Quests',      icon: <Swords      className="w-4 h-4" /> },
  { id: 'shop',         label: 'Bazaar',       icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'achievements', label: 'Achievements', icon: <Trophy      className="w-4 h-4" /> },
];

export const DashboardPage = () => {
  const [tab,     setTab]     = useState('quests');
  const [levelUp, setLevelUp] = useState(null);   // new level number, or null
  const [reward,  setReward]  = useState(null);   // full result object, or null

  // Called by TaskList after completeTask resolves
  const handleQuestComplete = (result) => {
    if (!result) return;
    // Always show the reward toast
    setReward(result);
    // Additionally show the level-up modal if we levelled up
    if (result.didLevelUp) {
      setLevelUp(result.newLevel);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Tab navigation */}
      <nav
        className="backdrop-blur-sm border-b sticky z-40"
        style={{
          background: 'rgba(30,30,46,0.9)',
          borderColor: '#363654',
          top: '73px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1" role="tablist" aria-label="Main navigation">
            {NAV.map(n => (
              <button
                key={n.id}
                role="tab"
                aria-selected={tab === n.id}
                onClick={() => setTab(n.id)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all focus:outline-none"
                style={{
                  borderBottomColor: tab === n.id ? '#e08c0d' : 'transparent',
                  color: tab === n.id ? '#f7a017' : '#9ca3af',
                }}
                onFocus={e => e.currentTarget.style.outline = '2px solid #f7a017'}
                onBlur={e  => e.currentTarget.style.outline = 'none'}
              >
                {n.icon}
                <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {tab === 'quests' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Left: quests */}
            <div className="space-y-5 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl flex items-center gap-2">
                    <Swords className="w-5 h-5" style={{ color: '#f7a017' }} />
                    Quest Board
                  </h1>
                  <p className="text-sm mt-0.5 font-body" style={{ color: '#9ca3af' }}>
                    Complete quests to earn XP &amp; Gold
                  </p>
                </div>
                <TaskForm />
              </div>
              <TaskList onComplete={handleQuestComplete} />
            </div>

            {/* Right: character panel (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky" style={{ top: '125px' }}>
                <CharacterPanel />
              </div>
            </div>
          </div>
        )}

        {tab === 'shop'         && <ShopPage />}
        {tab === 'achievements' && <AchievementsPage />}
      </main>

      {/* ── Level-up modal ── */}
      <AnimatePresence>
        {levelUp && (
          <LevelUpModal
            key="levelup"
            level={levelUp}
            onClose={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Reward toast — shows for ALL completions including level-ups ── */}
      <AnimatePresence>
        {reward && (
          <RewardToast
            key={`reward-${reward.xpGain}-${Date.now()}`}
            reward={reward}
            onDone={() => setReward(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
