import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import NewTaskModal from './NewTaskModal';
import { useTaskStore } from '../store/useTaskStore';
import { Plus, LayoutDashboard, Loader } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'Yapılacaklar' },
  { id: 'IN_PROGRESS', title: 'Devam Edenler' },
  { id: 'DONE', title: 'Tamamlananlar' }
];

const TaskBoard = () => {
  const { tasks, fetchTasks, updateTaskStatus, connectWebSocket, disconnectWebSocket, isLoading } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id; // column id
    const task = active.data.current?.task;

    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-board-bg">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Evre</h1>
            <p className="text-xs text-slate-400 font-medium">Gerçek Zamanlı Görev Yönetimi</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Yeni Görev
        </button>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        {isLoading && tasks.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-400 gap-3">
            <Loader className="animate-spin" />
            <span>Görevler yükleniyor...</span>
          </div>
        ) : (
          <div className="flex items-start gap-6 h-full min-w-max">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {COLUMNS.map(column => (
                <TaskColumn 
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={tasks.filter(t => t.status === column.id)}
                />
              ))}
            </DndContext>
          </div>
        )}
      </main>

      {isModalOpen && (
        <NewTaskModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default TaskBoard;
