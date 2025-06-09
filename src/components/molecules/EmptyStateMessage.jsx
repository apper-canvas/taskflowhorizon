import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyStateMessage = ({ filter, selectedCategory, onAddTask }) => {
    const getHeading = () => {
        if (filter === 'completed') return 'No completed tasks yet';
        if (filter === 'active') return 'No active tasks';
        if (selectedCategory !== 'all') return `No tasks in ${selectedCategory}`;
        return 'Ready to be productive?';
    };

    const getParagraph = () => {
        if (filter === 'completed') return 'Complete some tasks to see them here.';
        if (filter === 'active') return 'All tasks are completed! Great job!';
        if (selectedCategory !== 'all') return `Add your first task to the ${selectedCategory} category.`;
        return 'Add your first task and start getting things done.';
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-20"
        >
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
                <ApperIcon name="CheckSquare" className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {getHeading()}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {getParagraph()}
            </p>
            
            {filter !== 'completed' && (
                <Button
                    onClick={onAddTask}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
                >
                    <ApperIcon name="Plus" className="w-4 h-4 mr-2 inline" />
                    Add Your First Task
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyStateMessage;