import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TaskCheckbox from '@/components/molecules/TaskCheckbox';
import SelectionCheckbox from '@/components/molecules/SelectionCheckbox';
import TaskMeta from '@/components/molecules/TaskMeta';
import TaskItemActions from '@/components/molecules/TaskItemActions';
import TaskTimer from '@/components/molecules/TaskTimer';
import TaskForm from '@/components/organisms/TaskForm';
import { isPast } from 'date-fns';
import { getHighlightedParts } from '@/utils/searchUtils';
import { formatTime } from '@/utils/timerUtils';

const TaskItem = React.forwardRef(({ 
    task, 
    categories, 
    onToggleComplete, 
    onDelete, 
    onEdit, 
    onDragStart, 
    onDragOver, 
    onDrop, 
    index, 
    searchQuery = '',
    isSelected = false,
    onSelectionChange,
    showSelection = false
}, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed;

    const handleSave = (updates) => {
        onEdit(task.id, updates);
        setIsEditing(false);
    };

    // Get highlighted text parts for search
    const titleParts = getHighlightedParts(task.title || '', searchQuery);
    const descriptionParts = getHighlightedParts(task.description || '', searchQuery);

    const renderHighlightedText = (parts, className = '') => {
        return parts.map((part, index) => (
            <span
                key={index}
                className={part.highlighted ? 'bg-yellow-200 font-medium px-0.5 rounded' : ''}
            >
                {part.text}
            </span>
        ));
    };

return (
        <motion.div
            ref={ref}
            key={task.id}
            layout
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            draggable={!task.completed && !showSelection}
            onDragStart={(e) => onDragStart(e, task)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, task)}
            className={`
                bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 
                ${!showSelection ? 'cursor-move' : 'cursor-default'}
                ${task.completed ? 'opacity-75' : ''}
                ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}
                ${isSelected ? 'task-selected' : ''}
            `}
        >
<div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Selection Checkbox - only show when selection mode is active */}
                    {showSelection && (
                        <SelectionCheckbox
                            isSelected={isSelected}
                            onChange={() => onSelectionChange(task.id)}
                            className="selection-checkbox mt-0.5"
                            aria-label={`Select task: ${task.title}`}
                        />
                    )}

                    {/* Completion Checkbox */}
                    <TaskCheckbox
                        isCompleted={task.completed}
                        onToggle={(e) => onToggleComplete(task, e)}
                    />
                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <TaskForm
                                initialData={task}
                                categories={categories}
                                onSubmit={handleSave}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <>
<div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h3 className={`font-medium break-words ${
                                            task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                        }`}>
                                            {searchQuery ? renderHighlightedText(titleParts) : task.title}
                                        </h3>
                                        {task.description && (
                                            <p className={`text-sm mt-1 break-words ${
                                                task.completed ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {searchQuery ? renderHighlightedText(descriptionParts) : task.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Actions */}
                                    {!task.completed && (
                                        <TaskItemActions
                                            onEditClick={() => setIsEditing(true)}
                                            onDeleteClick={() => onDelete(task.id)}
                                        />
                                    )}
</div>

                                {/* Task Meta */}
                                <div className="flex items-center justify-between mt-3">
                                    <TaskMeta
                                        category={task.category}
                                        priority={task.priority}
                                        dueDate={task.dueDate}
                                        isCompleted={task.completed}
                                        categoriesList={categories}
                                    />
                                    
                                    {/* Time Spent & Expand Button */}
                                    <div className="flex items-center gap-3">
                                        {(task.timeSpent > 0 || task.isTimerRunning) && (
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <span>Time:</span>
                                                <span className="font-medium">{formatTime(task.timeSpent || 0)}</span>
                                            </div>
                                        )}
                                        
                                        {!task.completed && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsExpanded(!isExpanded);
                                                }}
                                                className="p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                                                aria-label={isExpanded ? "Collapse task details" : "Expand task details"}
                                                aria-expanded={isExpanded}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Timer Section */}
                                <AnimatePresence>
                                    {isExpanded && !task.completed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Timer</h4>
                                                </div>
                                                <TaskTimer
                                                    task={task}
                                                    onUpdate={onEdit}
                                                    className="justify-start"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

// Add display name for better debugging
TaskItem.displayName = 'TaskItem';

export default TaskItem;