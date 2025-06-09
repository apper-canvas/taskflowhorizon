import React from 'react';
import { motion } from 'framer-motion';
import ProgressRing from '@/components/molecules/ProgressRing';

const DashboardHeader = ({ completedToday, totalToday, completionPercentage }) => {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-shrink-0 h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-40"
        >
            <div>
                <h1 className="text-2xl font-bold font-heading text-gray-900">TaskFlow</h1>
                <p className="text-sm text-gray-500">
                    {completedToday} of {totalToday} tasks completed today
                </p>
            </div>
            
            <ProgressRing percentage={completionPercentage} />
        </motion.header>
    );
};

export default DashboardHeader;