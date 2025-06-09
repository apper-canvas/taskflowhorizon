import React from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Clock } from 'lucide-react';
import { formatTimeDetailed } from '@/utils/timerUtils';
import useTimer from '@/hooks/useTimer';

const TaskTimer = ({ task, onUpdate, className = '' }) => {
  const { isRunning, elapsedTime, toggleTimer } = useTimer(task, onUpdate);

  const handleToggleTimer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTimer();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTimer();
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Timer Display */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span 
          className="timer-display font-mono"
          aria-label={`Time spent: ${formatTimeDetailed(elapsedTime)}`}
        >
          {formatTimeDetailed(elapsedTime)}
        </span>
        {isRunning && (
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full timer-running-indicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            aria-label="Timer is running"
          />
        )}
      </div>

      {/* Timer Control Button */}
      <motion.button
        onClick={handleToggleTimer}
        onKeyDown={handleKeyDown}
        className={`
          timer-button px-3 py-1.5 rounded-md text-sm font-medium
          flex items-center gap-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${isRunning 
            ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500' 
            : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
          }
          ${isRunning ? 'running' : ''}
        `}
        whileTap={{ scale: 0.95 }}
        aria-label={isRunning ? 'Stop timer' : 'Start timer'}
        aria-pressed={isRunning}
        role="button"
        tabIndex={0}
      >
        {isRunning ? (
          <>
            <Square className="w-3 h-3" fill="currentColor" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-3 h-3" fill="currentColor" />
            Start
          </>
        )}
      </motion.button>
    </div>
  );
};

export default TaskTimer;