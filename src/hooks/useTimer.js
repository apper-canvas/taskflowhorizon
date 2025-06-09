import { useState, useEffect, useRef, useCallback } from 'react';
import { timerStorage, validateTimeInput, calculateElapsedTime } from '@/utils/timerUtils';

/**
 * Custom hook for managing task timers
 * @param {Object} task - The task object
 * @param {Function} onUpdate - Callback when timer state changes
 * @returns {Object} Timer state and control functions
 */
export const useTimer = (task, onUpdate) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Initialize timer state from localStorage on mount
  useEffect(() => {
    if (!task) return;

    const storedState = timerStorage.getTimerState(task.id);
    
    if (storedState && storedState.isRunning) {
      // Resume timer from stored state
      const stored = new Date(storedState.startTime);
      const now = Date.now();
      const sessionTime = Math.floor((now - stored.getTime()) / 1000);
      
      setIsRunning(true);
      setStartTime(stored);
      setElapsedTime(calculateElapsedTime({
        ...task,
        isTimerRunning: true,
        timerStartedAt: stored.toISOString()
      }));
    } else {
      // Initialize from task data
      setElapsedTime(calculateElapsedTime(task));
      setIsRunning(task.isTimerRunning || false);
      if (task.timerStartedAt) {
        setStartTime(new Date(task.timerStartedAt));
      }
    }
  }, [task]);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const baseTime = task.timeSpent || 0;
        const sessionTime = Math.floor((now - startTime.getTime()) / 1000);
        const newElapsedTime = validateTimeInput(baseTime + sessionTime);
        
        setElapsedTime(newElapsedTime);
        
        // Update localStorage every 5 seconds to avoid excessive writes
        if (now - lastUpdateRef.current > 5000) {
          timerStorage.setTimerState(task.id, {
            isRunning: true,
            startTime: startTime.toISOString(),
            lastUpdate: now
          });
          lastUpdateRef.current = now;
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, startTime, task.id, task.timeSpent]);

  // Start timer
  const startTimer = useCallback(() => {
    if (isRunning) return;

    const now = new Date();
    setIsRunning(true);
    setStartTime(now);
    lastUpdateRef.current = Date.now();

    // Save to localStorage
    timerStorage.setTimerState(task.id, {
      isRunning: true,
      startTime: now.toISOString(),
      lastUpdate: Date.now()
    });

    // Update task in backend
    if (onUpdate) {
      onUpdate(task.id, {
        isTimerRunning: true,
        timerStartedAt: now.toISOString()
      });
    }
  }, [isRunning, task.id, onUpdate]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (!isRunning || !startTime) return;

    const now = Date.now();
    const sessionTime = Math.floor((now - startTime.getTime()) / 1000);
    const newTotalTime = validateTimeInput((task.timeSpent || 0) + sessionTime);

    setIsRunning(false);
    setElapsedTime(newTotalTime);
    setStartTime(null);

    // Clear timer state from localStorage
    timerStorage.clearTimerState(task.id);

    // Update task in backend
    if (onUpdate) {
      onUpdate(task.id, {
        timeSpent: newTotalTime,
        isTimerRunning: false,
        timerStartedAt: null
      });
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, startTime, task.id, task.timeSpent, onUpdate]);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    elapsedTime,
    startTimer,
    stopTimer,
    toggleTimer
  };
};

export default useTimer;