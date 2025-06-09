import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import KanbanCard from '@/components/molecules/KanbanCard';
import { toast } from 'react-toastify';

const COLUMNS = {
  todo: {
    id: 'todo',
    title: 'To Do',
    color: 'bg-kanban-todo border-kanban-todo-border',
    icon: AlertCircle
  },
  inprogress: {
    id: 'inprogress',
    title: 'In Progress',
    color: 'bg-kanban-inprogress border-kanban-inprogress-border',
    icon: Clock
  },
  done: {
    id: 'done',
    title: 'Done',
    color: 'bg-kanban-done border-kanban-done-border',
    icon: CheckSquare
  }
};

const KanbanBoard = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskToggleComplete, 
  onTaskDelete, 
  onTaskEdit,
  categories,
  searchQuery = ''
}) => {
  const [draggedTask, setDraggedTask] = useState(null);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      inprogress: [],
      done: []
    };

    tasks.forEach(task => {
      // Map completed status to 'done', otherwise use task.status or default to 'todo'
      let status = task.completed ? 'done' : (task.status || 'todo');
      
      // Ensure status is valid
      if (!grouped[status]) {
        status = 'todo';
      }

      grouped[status].push(task);
    });

    // Sort tasks within each column
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        // Completed tasks go to bottom within done column
        if (status === 'done' && a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.order - b.order;
      });
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (result) => {
    const task = tasks.find(t => t.id === result.draggableId);
    setDraggedTask(task);
  };

  const handleDragEnd = async (result) => {
    setDraggedTask(null);
    
    const { destination, source, draggableId } = result;

    // No destination (dropped outside)
    if (!destination) {
      return;
    }

    // No change
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    
    try {
      // Determine updates based on new status
      let updates = { status: newStatus };
      
      if (newStatus === 'done' && !task.completed) {
        // Moving to done column completes the task
        updates.completed = true;
        updates.completedAt = new Date().toISOString();
        
        // Stop timer if running
        if (task.isTimerRunning) {
          const now = Date.now();
          const timeSpent = (task.timeSpent || 0) + (now - new Date(task.timerStartedAt).getTime());
          updates.timeSpent = timeSpent;
          updates.isTimerRunning = false;
          updates.timerStartedAt = null;
        }
      } else if (newStatus !== 'done' && task.completed) {
        // Moving from done column uncompletes the task
        updates.completed = false;
        updates.completedAt = null;
      }

      await onTaskUpdate(task.id, updates);
      
      if (newStatus === 'done' && !task.completed) {
        toast.success(`Task moved to ${COLUMNS[newStatus].title}! 🎉`);
      } else {
        toast.success(`Task moved to ${COLUMNS[newStatus].title}`);
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const renderEmptyColumn = (columnId) => {
    const column = COLUMNS[columnId];
    const IconComponent = column.icon;
    
    return (
      <div className="kanban-empty-column">
        <IconComponent className="kanban-empty-icon" />
        <p className="text-sm font-medium">No tasks in {column.title}</p>
        <p className="text-xs mt-1">Drag tasks here to change status</p>
      </div>
    );
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {Object.values(COLUMNS).map(column => (
          <div key={column.id} className={`kanban-column ${column.color}`}>
            <div className="kanban-column-header">
              <div className="flex items-center gap-2">
                <column.icon className="w-5 h-5 text-gray-600" />
                <h3 className="kanban-column-title">{column.title}</h3>
              </div>
              <div className="kanban-column-count">
                {tasksByStatus[column.id].length}
              </div>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-cards ${
                    snapshot.isDraggingOver ? 'drag-over' : ''
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {tasksByStatus[column.id].length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1"
                      >
                        {renderEmptyColumn(column.id)}
                      </motion.div>
                    ) : (
                      tasksByStatus[column.id].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={false}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className={`kanban-card ${
                                snapshot.isDragging ? 'dragging' : ''
                              }`}
                            >
                              <KanbanCard
                                task={task}
                                categories={categories}
                                onToggleComplete={onTaskToggleComplete}
                                onEdit={onTaskEdit}
                                onDelete={onTaskDelete}
                                searchQuery={searchQuery}
                                isDragging={snapshot.isDragging}
                              />
                            </motion.div>
                          )}
                        </Draggable>
                      ))
                    )}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;