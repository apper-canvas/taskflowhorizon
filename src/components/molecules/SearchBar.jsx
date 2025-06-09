import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search tasks...", className = "", wrapperClassName = "" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new debounce
        debounceRef.current = setTimeout(() => {
            onSearch(searchTerm.trim());
        }, 300);

        // Cleanup
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchTerm, onSearch]);

    const handleClear = () => {
        setSearchTerm('');
        onSearch('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
<motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`relative ${wrapperClassName}`}
        >
            <div className={`relative flex items-center bg-white border rounded-lg transition-all duration-200 ${
                isFocused ? 'border-secondary shadow-md ring-2 ring-secondary/20' : 'border-gray-200 shadow-sm'
            }`}>
                {/* Search Icon */}
                <div className="flex items-center justify-center w-10 h-10 text-gray-400">
                    <Search size={18} />
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-2 py-3 text-sm bg-transparent border-none outline-none placeholder-gray-400"
                />

                {/* Clear Button */}
                {searchTerm && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleClear}
                        className="flex items-center justify-center w-8 h-8 mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        type="button"
                    >
                        <X size={14} />
                    </motion.button>
                )}
            </div>

            {/* Search Indicator */}
            {searchTerm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-6 left-0 text-xs text-gray-500"
                >
                    Searching for "{searchTerm}"...
                </motion.div>
            )}
        </motion.div>
    );
};

export default SearchBar;