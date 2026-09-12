import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2, ChevronDown, ChevronUp, Zap, Star, Clock, Edit3 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TASK_CATEGORIES, calculateTaskXP, calculateGoldReward } from '../../lib/rpgSystem';
import { EditTaskModal } from './EditTaskModal';

const DIFFICULTY_COLORS = {
  trivial: 'text-gray-400 border-gray-600',
  easy:    'text-green-400 border-green-700',
  medium:  'text-yellow-400 border-yellow-700',
  hard:    'text-orange-400 border-orange-700',
  epic:    'text-purple-400 border-purple-700',
};

const DIFFICULTY_LABELS = {
  trivial: '🌱 Trivial',
  easy:    '⚔️ Easy',
  medium:  '🗡️ Medium',
  hard:    '🔥 Hard',
  epic:    '💀 Epic',
};

const TaskCard = ({ task, onComplete, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);

  const category = TASK_CATEGORIES[task.category];
  const xp   = calculateTaskXP(task.difficulty);
  const gold = calculateGoldReward(task.difficulty);

  const handleComplete = async () => {
    if (task.completed || completing) return;
    setCompleting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    await onComplete(task.id);
    setCompleting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: completing ? 0.5 : 1, y: 0, scale: completing ? 0.97 : 1 }}
      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`bg-dark-800/80 border rounded-xl overflow-hidden transition-all
        ${task.completed ? 'border-dark-600 opacity-60' : 'border-dark-600 hover:border-primary-600'}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Complete button */}
          <button
            onClick={handleComplete}
            disabled={task.completed}
            className={`mt-0.5 flex-shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-full
              ${task.completed
                ? 'text-green-400 cursor-default'
                : 'text-gray-500 hover:text-green-400 hover:scale-110 active:scale-95'}`}
            aria-label={task.completed ? 'Quest completed' : `Complete quest: ${task.title}`}
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h4 className={`font-semibold text-base leading-snug ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Category badge */}
                {category && (
                  <span
                    className="text-lg"
                    role="img"
                    aria-label={`Category: ${category.name}`}
                    title={category.name}
                  >
                    {category.icon}
                  </span>
                )}
                {/* Difficulty badge */}
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${DIFFICULTY_COLORS[task.difficulty] || 'text-gray-400 border-gray-600'}`}>
                  {DIFFICULTY_LABELS[task.difficulty] || task.difficulty}
                </span>
              </div>
            </div>

            {/* Reward pills */}
            {!task.completed && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 text-purple-300">
                  <Zap className="w-3 h-3" /> +{xp} XP
                </span>
                <span className="flex items-center gap-1 text-primary-300">
                  <Star className="w-3 h-3" /> +{gold} Gold
                </span>
                {category && (
                  <span className="text-gray-400">
                    +1 {category.name}
                  </span>
                )}
              </div>
            )}

            {task.completed && task.completedAt && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Completed {new Date(task.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!task.completed && (
              <button
                onClick={() => onEdit(task)}
                className="text-gray-500 hover:text-primary-400 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
                aria-label={`Edit quest: ${task.title}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {task.description && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
                aria-expanded={expanded}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label={`Delete quest: ${task.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expanded && task.description && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 text-sm text-gray-400 pl-9 overflow-hidden"
            >
              {task.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const TaskList = ({ onComplete }) => {
  const { tasks, completeTask, deleteTask, updateTask } = useGame();
  const [filter, setFilter] = useState('active');
  const [editingTask, setEditingTask] = useState(null);

  const filtered = tasks.filter(t =>
    filter === 'all'       ? true :
    filter === 'active'    ? !t.completed :
                              t.completed
  );

  const handleComplete = async (taskId) => {
    const result = await completeTask(taskId);
    if (result && onComplete) onComplete(result);
    return result;
  };

  const FILTERS = [
    { value: 'active',    label: 'Active', count: tasks.filter(t => !t.completed).length },
    { value: 'completed', label: 'Done',   count: tasks.filter(t =>  t.completed).length },
    { value: 'all',       label: 'All',    count: tasks.length },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Quest filter">
        {FILTERS.map(f => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-400
              ${filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-gray-200'}`}
          >
            {f.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
              ${filter === f.value ? 'bg-primary-500/50' : 'bg-dark-600'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-500"
        >
          <div className="text-5xl mb-4">
            {filter === 'completed' ? '🏆' : '📜'}
          </div>
          <p className="text-lg font-medium text-gray-400">
            {filter === 'completed' ? 'No completed quests yet' : 'No active quests'}
          </p>
          <p className="text-sm mt-1">
            {filter === 'active' ? 'Add a new quest to begin your adventure!' : ''}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onDelete={deleteTask}
              onEdit={(t) => setEditingTask(t)}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Edit modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={async (id, updates) => {
          const result = await updateTask(id, updates);
          if (result?.success !== false) {
            setEditingTask(null);
          }
          return result;
        }}
      />
    </div>
  );
};
