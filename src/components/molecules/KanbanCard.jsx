import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Calendar, User, Clock, Play, Pause } from 'lucide-react';
import TaskCheckbox from '@/components/molecules/TaskCheckbox';
import TaskTimer from '@/components/molecules/TaskTimer';
import { isPast, format } from 'date-fns';
import { getHighlightedParts } from '@/utils/searchUtils';
import { formatTime } from '@/utils/timerUtils';

const KanbanCard = ({ 
  task, 
  categories, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  searchQuery = '',
  isDragging = false 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed;
  const category = categories.find(c => c.id === task.category);

  // Get highlighted text parts for search
  const titleParts = getHighlightedParts(task.title || '', searchQuery);
  const descriptionParts = getHighlightedParts(task.description || '', searchQuery);

  const renderHighlightedText = (parts) => {
    return parts.map((part, index) => (
      <span
        key={index}
        className={part.highlighted ? 'bg-yellow-200 font-medium px-0.5 rounded' : ''}
      >
        {part.text}
      </span>
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      layout
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <TaskCheckbox
            isCompleted={task.completed}
            onToggle={(e) => onToggleComplete(task, e)}
          />
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm leading-snug break-words ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {searchQuery ? renderHighlightedText(titleParts) : task.title}
            </h4>
            {task.description && (
              <p className={`text-xs mt-1 break-words ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {searchQuery ? renderHighlightedText(descriptionParts) : task.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {showActions && !task.completed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </motion.button>
        )}
      </div>

      {/* Card Meta */}
      <div className="space-y-2">
        {/* Priority & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          {task.priority && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
          {category && (
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs text-gray-600">{category.name}</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600' : 'text-gray-500'
          }`}>
            <Calendar className="w-3 h-3" />
            <span>
              {format(new Date(task.dueDate), 'MMM d')}
              {isOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
            </span>
          </div>
        )}

        {/* Timer Info */}
        {(task.timeSpent > 0 || task.isTimerRunning) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(task.timeSpent || 0)}</span>
              {task.isTimerRunning && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
              )}
            </div>
            
            {!task.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimer(!showTimer);
                }}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                {task.isTimerRunning ? (
                  <Pause className="w-3 h-3 text-green-600" />
                ) : (
                  <Play className="w-3 h-3 text-gray-500" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Expanded Timer */}
        {showTimer && !task.completed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-2 border-t border-gray-100"
          >
            <TaskTimer
              task={task}
              onUpdate={onEdit}
              className="justify-start scale-90"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default KanbanCard;