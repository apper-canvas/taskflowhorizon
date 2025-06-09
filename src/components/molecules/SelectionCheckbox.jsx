import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const SelectionCheckbox = React.forwardRef(({ 
    isSelected = false, 
    onChange, 
    isIndeterminate = false,
    className = "",
    ...props 
}, ref) => {
    return (
        <motion.button
            ref={ref}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onChange}
            className={`
                flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center 
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1
                ${isSelected || isIndeterminate
                    ? 'bg-secondary border-secondary text-white' 
                    : 'border-gray-300 hover:border-secondary bg-white'
                }
                ${className}
            `}
            aria-checked={isIndeterminate ? 'mixed' : isSelected}
            role="checkbox"
            {...props}
        >
            {isSelected && !isIndeterminate && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15 }}
                >
                    <ApperIcon name="Check" className="w-3 h-3" />
                </motion.div>
            )}
            {isIndeterminate && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="w-2.5 h-0.5 bg-white rounded"
                />
            )}
        </motion.button>
    );
});

SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox;