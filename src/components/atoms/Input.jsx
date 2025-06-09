import React from 'react';

const Input = ({ tag = 'input', options = [], className, ...props }) => {
    switch (tag) {
        case 'textarea':
            return (
                <textarea
                    className={`w-full text-sm text-gray-600 bg-transparent border-none outline-none placeholder-gray-400 resize-none ${className}`}
                    {...props}
                />
            );
        case 'select':
            return (
                <select
                    className={`px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-secondary ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        default:
            return (
                <input
                    className={`w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 ${className}`}
                    {...props}
                />
            );
    }
};

export default Input;