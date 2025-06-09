import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const TaskItemActions = ({ onEditClick, onDeleteClick }) => {
    return (
        <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEditClick}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ApperIcon name="Edit2" className="w-4 h-4" />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDeleteClick}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
                <ApperIcon name="Trash2" className="w-4 h-4" />
            </motion.button>
        </div>
    );
};

export default TaskItemActions;