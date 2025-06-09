import React from 'react';
import { format, isToday, isPast, isThisWeek } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

const TaskMeta = ({ category, priority, dueDate, isCompleted, categoriesList }) => {
    const getPriorityColor = (prio) => {
        switch (prio) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const getPriorityIcon = (prio) => {
        switch (prio) {
            case 'high': return 'AlertTriangle';
            case 'medium': return 'Clock';
            case 'low': return 'CheckCircle2';
            default: return 'Circle';
        }
    };

    const formatDueDate = (date) => {
        if (!date) return null;
        const dueDateObj = new Date(date);
        
        if (isToday(dueDateObj)) return 'Today';
        if (isPast(dueDateObj)) return `Overdue`;
        if (isThisWeek(dueDateObj)) return format(dueDateObj, 'EEEE');
        return format(dueDateObj, 'MMM d');
    };

    const isDueSoon = (date) => {
        if (!date) return false;
        const dueDateObj = new Date(date);
        return isToday(dueDateObj) || isPast(dueDateObj);
    };

    const categoryColor = categoriesList.find(c => c.name === category)?.color || '#6B7280';

    return (
        <div className="flex items-center gap-4 mt-3">
            {/* Category */}
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                />
                <span className="text-xs text-gray-500">{category}</span>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-1">
                <ApperIcon
                    name={getPriorityIcon(priority)}
                    className="w-3 h-3"
                    style={{ color: getPriorityColor(priority) }}
                />
                <span className="text-xs text-gray-500 capitalize">{priority}</span>
            </div>

            {/* Due Date */}
            {dueDate && (
                <div className={`flex items-center gap-1 ${
                    isDueSoon(dueDate) && !isCompleted ? 'text-red-500' : 'text-gray-500'
                }`}>
                    <ApperIcon name="Calendar" className="w-3 h-3" />
                    <span className="text-xs">{formatDueDate(dueDate)}</span>
                </div>
            )}
        </div>
    );
};

export default TaskMeta;