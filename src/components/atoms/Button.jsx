import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, className, onClick, type = 'button', whileHover, whileTap, ...props }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={className}
            whileHover={whileHover || { scale: 1.05 }}
            whileTap={whileTap || { scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;