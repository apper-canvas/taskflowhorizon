import React from 'react';
import Button from '@/components/atoms/Button';

const CategoryFilterButton = ({ category, count, isActive, onClick }) => {
    const buttonClass = `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

    return (
        <Button onClick={onClick} className={buttonClass} whileHover={{ scale: 1 }} whileTap={{ scale: 0.98 }}>
            <div className="flex items-center">
                <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                />
                {category.name}
            </div>
            <span className="text-xs opacity-75">{count}</span>
        </Button>
    );
};

export default CategoryFilterButton;