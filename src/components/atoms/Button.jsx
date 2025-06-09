import React from 'react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({ children, className, onClick, type = 'button', whileHover, whileTap, ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
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
});

// Add display name for better debugging
Button.displayName = 'Button';

export default Button;