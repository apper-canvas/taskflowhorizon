import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TaskCheckbox from '@/components/molecules/TaskCheckbox';
import TaskMeta from '@/components/molecules/TaskMeta';
import TaskItemActions from '@/components/molecules/TaskItemActions';
import TaskForm from '@/components/organisms/TaskForm';
import { isPast } from 'date-fns';

const TaskItem = ({ task, categories, onToggleComplete, onDelete, onEdit, onDragStart, onDragOver, onDrop, index }) => {
    const [isEditing, setIsEditing] = useState(false);
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed;

    const handleSave = (updates) => {
        onEdit(task.id, updates);
        setIsEditing(false);
    };

    return (
        <motion.div
            key={task.id}
            layout
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            draggable={!task.completed}
            onDragStart={(e) => onDragStart(e, task)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, task)}
            className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
                task.completed ? 'opacity-75' : ''
            } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
        >
            <div className="p-4">
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
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
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p className={`text-sm mt-1 break-words ${
                                                task.completed ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {task.description}
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
                                <TaskMeta
                                    category={task.category}
                                    priority={task.priority}
                                    dueDate={task.dueDate}
                                    isCompleted={task.completed}
                                    categoriesList={categories}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskItem;