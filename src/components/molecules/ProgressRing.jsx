import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({ percentage }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference * (percentage / 100)} ${circumference}`;

    return (
        <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="4"
                />
                <motion.circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: strokeDasharray }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
            </div>
        </div>
    );
};

export default ProgressRing;