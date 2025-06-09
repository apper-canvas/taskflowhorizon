import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, isPast, isThisWeek } from 'date-fns';
import EmptyStateMessage from '@/components/molecules/EmptyStateMessage';
import QuickAddTaskButton from '@/components/molecules/QuickAddTaskButton';
import TaskForm from '@/components/organisms/TaskForm';
import TaskItem from '@/components/organisms/TaskItem';
import { taskService } from '@/services'; // Ensure this path is correct

const TaskFeatureArea = ({ tasks, setTasks, categories, filter, selectedCategory }) => {
    const [showForm, setShowForm] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);

    const filteredTasks = tasks.filter(task => {
        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
            return false;
        }
        
        // Status filter
        if (filter === 'active' && task.completed) return false;
        if (filter === 'completed' && !task.completed) return false;
        
        return true;
    }).sort((a, b) => {
        // Sort by completion status first (active tasks first)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then by order
        return a.order - b.order;
    });

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
            toast.success('Task updated');
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

    if (filteredTasks.length === 0 && !showForm) {
        return (
            <div className="p-6 max-w-full overflow-hidden">
                <EmptyStateMessage
                    filter={filter}
                    selectedCategory={selectedCategory}
                    onAddTask={() => setShowForm(true)}
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-full overflow-hidden">
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