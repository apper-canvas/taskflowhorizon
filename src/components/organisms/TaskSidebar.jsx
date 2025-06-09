import React from 'react';
import { motion } from 'framer-motion';
import TaskFilterButton from '@/components/molecules/TaskFilterButton';
import CategoryFilterButton from '@/components/molecules/CategoryFilterButton';

const TaskSidebar = ({ tasks, categories, filter, selectedCategory, onFilterChange, onCategoryChange }) => {
    const activeTasksCount = tasks.filter(t => !t.completed).length;
    const completedTasksCount = tasks.filter(t => t.completed).length;

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-64 bg-surface border-r border-gray-100 overflow-y-auto scrollbar-thin z-40"
        >
            <div className="p-6">
                <div className="space-y-1 mb-6">
                    <TaskFilterButton
                        iconName="List"
                        label="All Tasks"
                        count={tasks.length}
                        isActive={filter === 'all'}
                        onClick={() => {
                            onFilterChange('all');
                            onCategoryChange('all');
                        }}
                    />
                    <TaskFilterButton
                        iconName="Circle"
                        label="Active"
                        count={activeTasksCount}
                        isActive={filter === 'active'}
                        onClick={() => {
                            onFilterChange('active');
                            onCategoryChange('all');
                        }}
                    />
                    <TaskFilterButton
                        iconName="CheckCircle"
                        label="Completed"
                        count={completedTasksCount}
                        isActive={filter === 'completed'}
                        onClick={() => {
                            onFilterChange('completed');
                            onCategoryChange('all');
                        }}
                    />
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Categories
                    </h3>
                    <div className="space-y-1">
                        {categories.map(category => {
                            const categoryTasks = tasks.filter(t => t.category === category.name);
                            return (
                                <CategoryFilterButton
                                    key={category.id}
                                    category={category}
                                    count={categoryTasks.length}
                                    isActive={selectedCategory === category.name}
                                    onClick={() => {
                                        onCategoryChange(category.name);
                                        onFilterChange('all');
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.aside>
    );
};

export default TaskSidebar;