import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import ApperIcon from '../components/ApperIcon';
import { taskService, categoryService } from '../services';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const completedToday = tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const today = new Date().toDateString();
    const completedDate = new Date(task.completedAt).toDateString();
    return today === completedDate;
  }).length;

  const totalToday = tasks.filter(task => {
    if (task.completed) return true;
    if (!task.dueDate) return true;
    const today = new Date().toDateString();
    const dueDate = new Date(task.dueDate).toDateString();
    return today >= dueDate;
  }).length;

  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-white">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-surface border-r border-gray-100 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
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
        
        {/* Progress Ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="4"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${175.93 * (completionPercentage / 100)} 175.93`}
              initial={{ strokeDasharray: "0 175.93" }}
              animate={{ strokeDasharray: `${175.93 * (completionPercentage / 100)} 175.93` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-900">{completionPercentage}%</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-64 bg-surface border-r border-gray-100 overflow-y-auto scrollbar-thin z-40"
        >
          <div className="p-6">
            <div className="space-y-1 mb-6">
              <button
                onClick={() => {
                  setFilter('all');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <ApperIcon name="List" className="w-4 h-4 mr-3" />
                  All Tasks
                </div>
                <span className="text-xs opacity-75">{tasks.length}</span>
              </button>
              
              <button
                onClick={() => {
                  setFilter('active');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'active' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <ApperIcon name="Circle" className="w-4 h-4 mr-3" />
                  Active
                </div>
                <span className="text-xs opacity-75">
                  {tasks.filter(t => !t.completed).length}
                </span>
              </button>
              
              <button
                onClick={() => {
                  setFilter('completed');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'completed' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <ApperIcon name="CheckCircle" className="w-4 h-4 mr-3" />
                  Completed
                </div>
                <span className="text-xs opacity-75">
                  {tasks.filter(t => t.completed).length}
                </span>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map(category => {
                  const categoryTasks = tasks.filter(t => t.category === category.name);
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setFilter('all');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.name 
                          ? 'bg-primary text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                      <span className="text-xs opacity-75">{categoryTasks.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Task Area */}
        <motion.main 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto scrollbar-thin bg-white"
        >
          <MainFeature 
            tasks={tasks}
            setTasks={setTasks}
            categories={categories}
            setCategories={setCategories}
            filter={filter}
            selectedCategory={selectedCategory}
          />
        </motion.main>
      </div>
    </div>
  );
}

export default Home;