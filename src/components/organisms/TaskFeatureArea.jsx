import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, isPast, isThisWeek } from 'date-fns';
import EmptyStateMessage from '@/components/molecules/EmptyStateMessage';
import QuickAddTaskButton from '@/components/molecules/QuickAddTaskButton';
import SearchBar from '@/components/molecules/SearchBar';
import TaskForm from '@/components/organisms/TaskForm';
import TaskItem from '@/components/organisms/TaskItem';
import { taskService } from '@/services';
import { fuzzySearch, taskMatchesSearch } from '@/utils/searchUtils';

const TaskFeatureArea = ({ tasks, setTasks, categories, filter, selectedCategory }) => {
    const [showForm, setShowForm] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTasks, setSelectedTasks] = useState(new Set());
    const [showSelection, setShowSelection] = useState(false);

    // Memoize filtered and searched tasks for performance
    const filteredTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            // Category filter
            if (selectedCategory !== 'all' && task.category !== selectedCategory) {
                return false;
            }
            
            // Status filter
            if (filter === 'active' && task.completed) return false;
            if (filter === 'completed' && !task.completed) return false;
            
            // Search filter
            if (searchQuery && !taskMatchesSearch(task, searchQuery)) {
                return false;
            }
            
            return true;
        });

        // If there's a search query, use fuzzy search for better ranking
        if (searchQuery) {
            const searchResults = fuzzySearch(filtered, searchQuery, {
                keys: ['title', 'description'],
                threshold: 0.4
            });
            
            // Sort search results by relevance score, then by completion status
            return searchResults.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return (a._searchScore || 0) - (b._searchScore || 0);
            });
        }

        // Default sorting when no search
        return filtered.sort((a, b) => {
            // Sort by completion status first (active tasks first)
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then by order
            return a.order - b.order;
        });
}, [tasks, selectedCategory, filter, searchQuery]);

    // Selection management
    const isAllSelected = filteredTasks.length > 0 && filteredTasks.every(task => selectedTasks.has(task.id));
    const isIndeterminate = selectedTasks.size > 0 && !isAllSelected;
    const selectedCount = selectedTasks.size;

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleToggleSelection = () => {
        setShowSelection(!showSelection);
        if (showSelection) {
            // Clear selection when hiding selection mode
            setSelectedTasks(new Set());
        }
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            // Deselect all
            setSelectedTasks(new Set());
        } else {
            // Select all filtered tasks
            const allTaskIds = new Set(filteredTasks.map(task => task.id));
            setSelectedTasks(allTaskIds);
        }
    };

    const handleTaskSelection = (taskId) => {
        setSelectedTasks(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(taskId)) {
                newSelection.delete(taskId);
            } else {
                newSelection.add(taskId);
            }
            return newSelection;
        });
    };

    const clearSelection = () => {
        setSelectedTasks(new Set());
    };
    const createConfetti = (element) => {
        const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'];
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece'; // Assuming global CSS for this
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            const angle = (360 / 12) * i;
            confetti.style.setProperty('--random-x', Math.cos(angle * Math.PI / 180) * 100 + 'px');
            confetti.style.setProperty('--random-y', Math.sin(angle * Math.PI / 180) * 100 + 'px');
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }
    };

    const handleAddTask = async (taskData) => {
        try {
            const created = await taskService.create({ ...taskData, order: tasks.length });
            setTasks(prev => [...prev, created]);
            setShowForm(false);
            toast.success('Task created successfully!');
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    const handleToggleComplete = async (task, event) => {
        try {
            const updated = await taskService.update(task.id, {
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null
            });
            
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
            
            if (!task.completed) {
                // Task was just completed
                createConfetti(event.target);
                toast.success('Task completed! 🎉');
            } else {
                toast.info('Task marked as incomplete');
            }
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await taskService.delete(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

const handleEditTask = async (taskId, updates) => {
        try {
            const updated = await taskService.update(taskId, updates);
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
            
            // Only show success toast for non-timer updates to avoid spam
            if (!('isTimerRunning' in updates) && !('timeSpent' in updates)) {
                toast.success('Task updated');
            }
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetTask) => {
        e.preventDefault();
        if (!draggedTask || draggedTask.id === targetTask.id) return;

        try {
            const draggedIndex = filteredTasks.findIndex(t => t.id === draggedTask.id);
            const targetIndex = filteredTasks.findIndex(t => t.id === targetTask.id);
            
            const newTasks = [...filteredTasks];
            newTasks.splice(draggedIndex, 1);
            newTasks.splice(targetIndex, 0, draggedTask);
            
            // Update order for all affected tasks
            // Map the *filtered* tasks back to their original IDs and assign new orders
            // This is a simplified reorder, a more robust solution would update orders globally
            // based on the new relative positions within the *entire* tasks array, not just filtered.
            // For now, assuming filteredTasks are a subset that can be reordered relative to each other.
            const updates = newTasks.map((task, index) => 
                taskService.update(task.id, { order: index })
            );
            
            await Promise.all(updates);
            
            // Refresh tasks from backend to get correct global order
            const refreshedTasks = await taskService.getAll();
            setTasks(refreshedTasks);
            
            setDraggedTask(null);
            toast.success('Task order updated');
        } catch (error) {
            toast.error('Failed to reorder tasks');
            setDraggedTask(null);
        }
    };

// Show empty state only when there are no tasks at all, or when search yields no results
    if (filteredTasks.length === 0 && !showForm) {
        const isSearchEmpty = searchQuery && tasks.length > 0;
        
        return (
            <div className="p-6 max-w-full overflow-hidden">
                {/* Search Bar */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search tasks by title or description..."
                    />
                </motion.div>

                {isSearchEmpty ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-6">
                            No tasks match your search for "<span className="font-medium">{searchQuery}</span>"
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-secondary hover:text-purple-700 font-medium"
                        >
                            Clear search
                        </button>
                    </motion.div>
                ) : (
                    <EmptyStateMessage
                        filter={filter}
                        selectedCategory={selectedCategory}
                        onAddTask={() => setShowForm(true)}
                    />
                )}
            </div>
        );
    }

return (
        <div className="p-6 max-w-full overflow-hidden">
            {/* Search Bar */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6"
            >
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search tasks by title or description..."
                />
            </motion.div>

            {/* Selection Controls */}
            {filteredTasks.length > 0 && (
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-6"
                >
                    <div className="task-list-header rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleToggleSelection}
                                className="text-sm font-medium text-secondary hover:text-purple-700 transition-colors"
                            >
                                {showSelection ? 'Cancel Selection' : 'Select Tasks'}
                            </button>
                            
                            {showSelection && (
                                <>
                                    <div className="w-px h-4 bg-gray-300" />
                                    <div className="flex items-center gap-3">
                                        <SelectionCheckbox
                                            isSelected={isAllSelected}
                                            isIndeterminate={isIndeterminate}
                                            onChange={handleSelectAll}
                                            aria-label="Select all tasks"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Select All ({filteredTasks.length})
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {showSelection && selectedCount > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    {selectedCount} selected
                                </span>
                                <button
                                    onClick={clearSelection}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Quick Add Bar / New Task Form */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8"
            >
                {!showForm ? (
                    <QuickAddTaskButton onClick={() => setShowForm(true)} />
                ) : (
                    <TaskForm
                        categories={categories}
                        onSubmit={handleAddTask}
                        onCancel={() => setShowForm(false)}
                    />
                )}
            </motion.div>

{/* Search Results Count */}
            {searchQuery && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 text-sm text-gray-600"
                >
                    Found {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </motion.div>
            )}

            {/* Task List */}
            <div className="space-y-3">
<AnimatePresence mode="popLayout">
                    {filteredTasks.map((task, index) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            categories={categories}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDeleteTask}
                            onEdit={handleEditTask}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            index={index}
                            searchQuery={searchQuery}
                            isSelected={selectedTasks.has(task.id)}
                            onSelectionChange={handleTaskSelection}
                            showSelection={showSelection}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Show Add Task Button at bottom if no form is shown */}
            {!showForm && filteredTasks.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-8 text-center"
                >
                    <QuickAddTaskButton
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
                    >
                         {/* Re-using QuickAddTaskButton, but overriding className as the original had slightly different button for "Add Another Task" */}
                        Add Another Task
                    </QuickAddTaskButton>
                </motion.div>
            )}
        </div>
    );
};

export default TaskFeatureArea;