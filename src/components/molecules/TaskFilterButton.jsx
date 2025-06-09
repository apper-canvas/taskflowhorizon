import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const TaskFilterButton = ({ iconName, label, count, isActive, onClick }) => {
    const buttonClass = `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

    return (
        <Button onClick={onClick} className={buttonClass} whileHover={{ scale: 1 }} whileTap={{ scale: 0.98 }}>
            <div className="flex items-center">
                <ApperIcon name={iconName} className="w-4 h-4 mr-3" />
                {label}
            </div>
            <span className="text-xs opacity-75">{count}</span>
        </Button>
    );
};

export default TaskFilterButton;