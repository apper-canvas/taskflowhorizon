import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const TaskCheckbox = ({ isCompleted, onToggle }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                isCompleted
                    ? 'bg-success border-success text-white'
                    : 'border-gray-300 hover:border-primary'
            }`}
        >
            {isCompleted && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="animate-bounce-in"
                >
                    <ApperIcon name="Check" className="w-3 h-3" />
                </motion.div>
            )}
        </motion.button>
    );
};

export default TaskCheckbox;