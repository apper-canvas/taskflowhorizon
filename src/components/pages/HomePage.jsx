import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import DashboardHeader from '@/components/organisms/DashboardHeader';
import TaskSidebar from '@/components/organisms/TaskSidebar';
import TaskFeatureArea from '@/components/organisms/TaskFeatureArea';
import { taskService, categoryService } from '@/services';

const HomePage = () => {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); // Default to true as data is fetched on mount
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [tasksData, categoriesData] = await Promise.all([
                taskService.getAll(),
                categoryService.getAll()
            ]);
            setTasks(tasksData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message || 'Failed to load data');
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const completedToday = tasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const today = new Date().toDateString();
        const completedDate = new Date(task.completedAt).toDateString();
        return today === completedDate;
    }).length;

    const totalToday = tasks.filter(task => {
        // A task counts towards totalToday if it's completed, or if it's active and its due date is today or in the past.
        // The original logic `if (task.completed) return true; if (!task.dueDate) return true;`
        // seemed to count all completed tasks, plus all tasks with no due date, plus tasks due today/past.
        // Re-interpreting the original logic based on typical task dashboard metrics:
        // totalToday = all tasks that are *due today or past*, OR *completed today* (if due date exists).
        // Let's stick closer to original `totalToday` definition, which seems to count all completed tasks
        // plus all tasks with no due date, plus tasks whose due date is today or earlier.
        if (task.completed) return true; // Completed tasks are always counted in total.
        if (!task.dueDate) return true; // Tasks with no due date are always counted in total (as "undated").
        const today = new Date().toDateString();
        const dueDate = new Date(task.dueDate).toDateString();
        return new Date(dueDate) <= new Date(today); // Due today or in the past
    }).length;

    const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    if (loading) {
        return (
            <div className="h-screen flex flex-col overflow-hidden bg-white">
                {/* Header Skeleton */}
                <div className="flex-shrink-0 h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Skeleton */}
                    <div className="w-64 bg-surface border-r border-gray-100 p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-12 bg-gray-200 rounded"></div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadData}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Try Again
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white">
            <DashboardHeader
                completedToday={completedToday}
                totalToday={totalToday}
                completionPercentage={completionPercentage}
            />

            <div className="flex-1 flex overflow-hidden">
                <TaskSidebar
                    tasks={tasks}
                    categories={categories}
                    filter={filter}
                    selectedCategory={selectedCategory}
                    onFilterChange={setFilter}
                    onCategoryChange={setSelectedCategory}
                />

                <motion.main
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 overflow-y-auto scrollbar-thin bg-white"
                >
                    <TaskFeatureArea
                        tasks={tasks}
                        setTasks={setTasks}
                        categories={categories}
                        filter={filter}
                        selectedCategory={selectedCategory}
                    />
                </motion.main>
            </div>
        </div>
    );
};

export default HomePage;