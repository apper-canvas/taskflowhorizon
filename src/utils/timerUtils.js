/**
 * Utility functions for timer functionality
 */

/**
 * Format time in seconds to human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "2h 15m 30s", "5m 23s", "45s")
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }
  
  return parts.join(' ');
};

/**
 * Format time for detailed display with leading zeros
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "02:15:30", "05:23", "00:45")
 */
export const formatTimeDetailed = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Parse time string back to seconds
 * @param {string} timeString - Formatted time string
 * @returns {number} Time in seconds
 */
export const parseTime = (timeString) => {
  if (!timeString) return 0;
  
  const parts = timeString.split(' ');
  let totalSeconds = 0;
  
  parts.forEach(part => {
    if (part.includes('h')) {
      totalSeconds += parseInt(part) * 3600;
    } else if (part.includes('m')) {
      totalSeconds += parseInt(part) * 60;
    } else if (part.includes('s')) {
      totalSeconds += parseInt(part);
    }
  });
  
  return totalSeconds;
};

/**
 * Validate time input and handle edge cases
 * @param {number} seconds - Time in seconds
 * @returns {number} Validated time in seconds
 */
export const validateTimeInput = (seconds) => {
  // Handle negative time
  if (seconds < 0) return 0;
  
  // Handle excessively long durations (more than 24 hours)
  const MAX_DURATION = 24 * 60 * 60; // 24 hours in seconds
  if (seconds > MAX_DURATION) return MAX_DURATION;
  
  // Handle NaN or invalid input
  if (isNaN(seconds) || !isFinite(seconds)) return 0;
  
  return Math.floor(seconds);
};

/**
 * Timer persistence utilities
 */
export const timerStorage = {
  getTimerState: (taskId) => {
    try {
      const stored = localStorage.getItem(`timer_${taskId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to get timer state from localStorage:', error);
      return null;
    }
  },
  
  setTimerState: (taskId, state) => {
    try {
      localStorage.setItem(`timer_${taskId}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save timer state to localStorage:', error);
    }
  },
  
  clearTimerState: (taskId) => {
    try {
      localStorage.removeItem(`timer_${taskId}`);
    } catch (error) {
      console.warn('Failed to clear timer state from localStorage:', error);
    }
  },
  
  getAllActiveTimers: () => {
    try {
      const activeTimers = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('timer_')) {
          const state = localStorage.getItem(key);
          if (state) {
            const parsed = JSON.parse(state);
            if (parsed.isRunning) {
              activeTimers.push({
                taskId: key.replace('timer_', ''),
                ...parsed
              });
            }
          }
        }
      }
      return activeTimers;
    } catch (error) {
      console.warn('Failed to get active timers from localStorage:', error);
      return [];
    }
  }
};

/**
 * Calculate elapsed time considering timer state
 * @param {Object} task - Task object with timer properties
 * @returns {number} Total elapsed time in seconds
 */
export const calculateElapsedTime = (task) => {
  if (!task) return 0;
  
  let totalTime = task.timeSpent || 0;
  
  // If timer is currently running, add the current session time
  if (task.isTimerRunning && task.timerStartedAt) {
    const startTime = new Date(task.timerStartedAt).getTime();
    const currentTime = Date.now();
    const sessionTime = Math.floor((currentTime - startTime) / 1000);
    totalTime += sessionTime;
  }
  
  return validateTimeInput(totalTime);
};