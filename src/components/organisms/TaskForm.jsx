import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';

const TaskForm = ({ initialData = {}, categories = [], onSubmit, onCancel }) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [category, setCategory] = useState(initialData.category || (categories[0]?.name || ''));
    const [priority, setPriority] = useState(initialData.priority || 'medium');
    const [dueDate, setDueDate] = useState(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');

    const inputRef = useRef();

    useEffect(() => {
        // Set focus when the form appears for new tasks
        if (!initialData.id && inputRef.current) {
            inputRef.current.focus();
        }
        // Ensure category is valid if categories list changes
        if (categories.length > 0 && !categories.some(cat => cat.name === category)) {
            setCategory(categories[0].name);
        }
    }, [initialData, categories, category]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
            dueDate: dueDate || null
        });

        // Reset form for new task creation
        if (!initialData.id) {
            setTitle('');
            setDescription('');
            setDueDate('');
            setCategory(categories[0]?.name || '');
            setPriority('medium');
        }
    };

    const categoryOptions = categories.map(cat => ({ value: cat.name, label: cat.name }));
    const priorityOptions = [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' }
    ];

    return (
        <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg"
        >
            <div className="space-y-4">
                <Input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className={initialData.id ? 'border-b border-gray-200 focus:border-primary pb-1 !text-base' : ''}
                    required
                />
                
                <Input
                    tag="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={2}
                    className="!text-sm"
                />
                
                <div className="flex flex-wrap gap-4">
                    <Input
                        tag="select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={categoryOptions}
                        className={initialData.id ? '!px-2 !py-1 !border-gray-200 !rounded !text-sm' : ''}
                    />
                    
                    <Input
                        tag="select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        options={priorityOptions}
                        className={initialData.id ? '!px-2 !py-1 !border-gray-200 !rounded !text-sm' : ''}
                    />
                    
                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={initialData.id ? '!px-2 !py-1 !border-gray-200 !rounded !text-sm' : ''}
                    />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    onClick={onCancel}
                    className={initialData.id ? 'px-3 py-1 text-sm text-gray-600 hover:text-gray-800' : 'px-4 py-2 text-gray-600 hover:text-gray-800 font-medium'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className={initialData.id ? 'px-4 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-purple-700' : 'px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 shadow-lg'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {initialData.id ? 'Save' : (<><ApperIcon name="Plus" className="w-4 h-4 mr-2 inline" /> Add Task</>)}
                </Button>
            </div>
        </motion.form>
    );
};

export default TaskForm;