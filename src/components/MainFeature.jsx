import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, isPast, isThisWeek } from 'date-fns';
import ApperIcon from './ApperIcon';
import { taskService } from '../services';

function MainFeature({ tasks, setTasks, categories, filter, selectedCategory }) {
  const [newTask, setNewTask] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showForm]);

  const filteredTasks = tasks.filter(task => {
    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }
    
    // Status filter
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    return true;
  }).sort((a, b) => {
    // Sort by completion status first (active tasks first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by order
    return a.order - b.order;
  });

  const createConfetti = (element) => {
    const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'];
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = centerX + 'px';
      confetti.style.top = centerY + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.3 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      
      const angle = (360 / 12) * i;
      confetti.style.setProperty('--random-x', Math.cos(angle * Math.PI / 180) * 100 + 'px');
      confetti.style.setProperty('--random-y', Math.sin(angle * Math.PI / 180) * 100 + 'px');
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const taskData = {
        title: newTask.trim(),
        description: taskDescription.trim(),
        category: taskCategory,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        completed: false,
        order: tasks.length
      };

      const created = await taskService.create(taskData);
      setTasks(prev => [...prev, created]);
      
      // Reset form
      setNewTask('');
      setTaskDescription('');
      setTaskDueDate('');
      setShowForm(false);
      
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleToggleComplete = async (task, event) => {
    try {
      const updated = await taskService.update(task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      if (!task.completed) {
        // Task was just completed
        createConfetti(event.target);
        toast.success('Task completed! 🎉');
      } else {
        toast.info('Task marked as incomplete');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = async (taskId, updates) => {
    try {
      const updated = await taskService.update(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setEditingTask(null);
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'Clock';
      case 'low': return 'CheckCircle2';
      default: return 'Circle';
    }
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    
    if (isToday(dueDate)) return 'Today';
    if (isPast(dueDate)) return `Overdue`;
    if (isThisWeek(dueDate)) return format(dueDate, 'EEEE');
    return format(dueDate, 'MMM d');
  };

  const isDueSoon = (date) => {
    if (!date) return false;
    const dueDate = new Date(date);
    return isToday(dueDate) || isPast(dueDate);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetTask) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    try {
      const draggedIndex = filteredTasks.findIndex(t => t.id === draggedTask.id);
      const targetIndex = filteredTasks.findIndex(t => t.id === targetTask.id);
      
      const newTasks = [...filteredTasks];
      newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, draggedTask);
      
      // Update order for all affected tasks
      const updates = newTasks.map((task, index) => 
        taskService.update(task.id, { order: index })
      );
      
      await Promise.all(updates);
      
      // Refresh tasks
      const refreshedTasks = await taskService.getAll();
      setTasks(refreshedTasks);
      
      setDraggedTask(null);
      toast.success('Task order updated');
    } catch (error) {
      toast.error('Failed to reorder tasks');
      setDraggedTask(null);
    }
  };

  if (filteredTasks.length === 0 && !showForm) {
    return (
      <div className="p-6 max-w-full overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <ApperIcon name="CheckSquare" className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {filter === 'completed' ? 'No completed tasks yet' : 
             filter === 'active' ? 'No active tasks' :
             selectedCategory !== 'all' ? `No tasks in ${selectedCategory}` :
             'Ready to be productive?'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {filter === 'completed' ? 'Complete some tasks to see them here.' :
             filter === 'active' ? 'All tasks are completed! Great job!' :
             selectedCategory !== 'all' ? `Add your first task to the ${selectedCategory} category.` :
             'Add your first task and start getting things done.'}
          </p>
          
          {filter !== 'completed' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2 inline" />
              Add Your First Task
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Quick Add Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full p-4 bg-surface border-2 border-dashed border-gray-300 rounded-lg text-left text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
          >
            <ApperIcon name="Plus" className="w-5 h-5 mr-3 inline group-hover:scale-110 transition-transform" />
            Add a new task...
          </button>
        ) : (
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleAddTask}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg"
          >
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400"
                required
              />
              
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add a description..."
                rows={2}
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none placeholder-gray-400 resize-none"
              />
              
              <div className="flex flex-wrap gap-4">
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-secondary"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-secondary"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-secondary"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewTask('');
                  setTaskDescription('');
                  setTaskDueDate('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2 inline" />
                Add Task
              </motion.button>
            </div>
          </motion.form>
        )}
      </motion.div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, index) => {
            const categoryColor = categories.find(c => c.name === task.category)?.color || '#6B7280';
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed;
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                draggable={!task.completed}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task)}
                className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
                  task.completed ? 'opacity-75' : ''
                } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleToggleComplete(task, e)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                        task.completed
                          ? 'bg-success border-success text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="animate-bounce-in"
                        >
                          <ApperIcon name="Check" className="w-3 h-3" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {editingTask === task.id ? (
                        <EditTaskForm
                          task={task}
                          categories={categories}
                          onSave={handleEditTask}
                          onCancel={() => setEditingTask(null)}
                        />
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className={`font-medium break-words ${
                                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className={`text-sm mt-1 break-words ${
                                  task.completed ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditingTask(task.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <ApperIcon name="Edit2" className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Task Meta */}
                          <div className="flex items-center gap-4 mt-3">
                            {/* Category */}
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: categoryColor }}
                              />
                              <span className="text-xs text-gray-500">{task.category}</span>
                            </div>

                            {/* Priority */}
                            <div className="flex items-center gap-1">
                              <ApperIcon 
                                name={getPriorityIcon(task.priority)} 
                                className="w-3 h-3"
                                style={{ color: getPriorityColor(task.priority) }}
                              />
                              <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                            </div>

                            {/* Due Date */}
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${
                                isDueSoon(task.dueDate) && !task.completed ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                <ApperIcon name="Calendar" className="w-3 h-3" />
                                <span className="text-xs">{formatDueDate(task.dueDate)}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show Add Task Button at bottom if no form is shown */}
      {!showForm && filteredTasks.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2 inline" />
            Add Another Task
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function EditTaskForm({ task, categories, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full font-medium bg-transparent border-none outline-none border-b border-gray-200 focus:border-primary pb-1"
        required
      />
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description..."
        rows={2}
        className="w-full text-sm text-gray-600 bg-transparent border-none outline-none resize-none"
      />
      
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-secondary focus:border-secondary"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-secondary focus:border-secondary"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-secondary focus:border-secondary"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-4 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Save
        </motion.button>
      </div>
    </form>
  );
}

export default MainFeature;