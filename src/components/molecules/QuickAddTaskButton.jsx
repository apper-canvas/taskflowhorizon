import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const QuickAddTaskButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full p-4 bg-surface border-2 border-dashed border-gray-300 rounded-lg text-left text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
        >
            <ApperIcon name="Plus" className="w-5 h-5 mr-3 inline group-hover:scale-110 transition-transform" />
            Add a new task...
        </button>
    );
};

export default QuickAddTaskButton;