import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { SHOP_ITEMS } from '../../lib/rpgSystem';

const TYPE_LABELS = { theme: '🎨 Theme', badge: '🏅 Badge', avatar: '👤 Avatar' };
const TYPE_FILTERS = ['all', 'theme', 'badge', 'avatar'];

const ShopCard = ({ item, owned, isEquipped, canAfford, onBuy, onEquip }) => {
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [equipping, setEquipping] = useState(false);

  const handleBuy = async () => {
    if (owned || buying || !canAfford) return;
    setBuying(true);
    const result = await onBuy(item);
    if (result?.success) {
      setBought(true);
      setTimeout(() => setBought(false), 2000);
    }
    setBuying(false);
  };

  const handleEquip = async () => {
    if (!owned || equipping || isEquipped) return;
    setEquipping(true);
    await onEquip(item);
    setEquipping(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`bg-dark-800/80 border rounded-xl p-5 flex flex-col gap-3 transition-all
        ${isEquipped ? 'border-primary-400 shadow-lg shadow-primary-900/30' : owned ? 'border-green-600/50' : canAfford ? 'border-dark-600 hover:border-primary-600' : 'border-dark-700 opacity-70'}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl" role="img" aria-label={item.name}>{item.icon}</span>
        <span className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-400">
          {TYPE_LABELS[item.type] || item.type}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-base flex items-center gap-1.5">
          {item.name}
          {isEquipped && <Sparkles className="w-4 h-4 text-primary-400" />}
        </h3>
        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-700">
        <div className="flex items-center gap-1.5 text-primary-300 font-bold">
          <Coins className="w-4 h-4" />
          <span>{item.price}</span>
        </div>

        {owned ? (
          item.type === 'theme' || item.type === 'avatar' || item.type === 'badge' ? (
            <motion.button
              onClick={handleEquip}
              disabled={equipping || isEquipped}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all
                ${isEquipped
                  ? 'bg-primary-600 text-white cursor-default'
                  : equipping
                    ? 'bg-dark-600 text-gray-300 cursor-wait'
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-200'}`}
            >
              {isEquipped ? 'Active' : equipping ? '...' : 'Equip'}
            </motion.button>
          ) : (
            <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Owned
            </span>
          )
        ) : (
          <motion.button
            onClick={handleBuy}
            disabled={!canAfford || buying}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-400
              ${canAfford
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'}`}
            aria-label={canAfford ? `Buy ${item.name} for ${item.price} gold` : `Not enough gold to buy ${item.name}`}
          >
            {!canAfford && <Lock className="w-3 h-3" />}
            {buying ? '...' : bought ? '✓ Bought!' : canAfford ? 'Buy' : 'Need Gold'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export const ShopPage = () => {
  const { stats, purchaseItem, equipItem } = useGame();
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState('');

  const handleBuy = async (item) => {
    const result = await purchaseItem(item);
    if (result.success) {
      setNotification(`✅ ${result.message}`);
    } else {
      setNotification(`❌ ${result.message}`);
    }
    setTimeout(() => setNotification(''), 2500);
    return result;
  };

  const handleEquip = async (item) => {
    const result = await equipItem(item);
    if (result.success) {
      setNotification(`✨ ${result.message}`);
    } else {
      setNotification(`❌ ${result.message}`);
    }
    setTimeout(() => setNotification(''), 2500);
  };

  const filtered = SHOP_ITEMS.filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-primary-400" />
            The Bazaar
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-body">Spend your hard-earned gold on theme upgrades &amp; avatars</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 px-4 py-2 rounded-lg">
          <Coins className="w-5 h-5 text-primary-400" />
          <span className="font-bold text-primary-300">{stats.gold}</span>
          <span className="text-gray-400 text-sm">gold</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Shop filter">
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-primary-400
              ${filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-gray-200'}`}
          >
            {f === 'all' ? 'All Items' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-dark-700 border border-primary-500/50 rounded-lg text-sm text-center text-primary-300"
            role="status"
            aria-live="polite"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(item => {
            const isOwned = stats.inventory.includes(item.id);
            const isEquipped =
              (item.type === 'theme' && stats.activeTheme === (item.themeValue || 'midnight')) ||
              (item.type === 'avatar' && stats.activeAvatar === item.icon) ||
              (item.type === 'badge' && stats.activeBadge === item.id);

            return (
              <ShopCard
                key={item.id}
                item={item}
                owned={isOwned}
                isEquipped={isEquipped}
                canAfford={stats.gold >= item.price}
                onBuy={handleBuy}
                onEquip={handleEquip}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
