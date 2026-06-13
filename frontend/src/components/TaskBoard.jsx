import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import NewTaskModal from './NewTaskModal';
import Sidebar from './Sidebar';
import ActivityLogPanel from './ActivityLogPanel';
import { useTaskStore } from '../store/useTaskStore';
import { Plus, LayoutDashboard, Loader } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const COLUMNS = [
  { id: 'TODO', title: 'Yapılacaklar' },
  { id: 'IN_PROGRESS', title: 'Devam Edenler' },
  { id: 'DONE', title: 'Tamamlananlar' }
];

const TaskBoard = () => {
  const { 
    tasks, 
    updateTaskStatus, 
    connectWebSocket, 
    disconnectWebSocket, 
    isLoading, 
    currentProjectId,
    projects
  } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Activate WebSocket subscription for task and logs
  useWebSocket();

  useEffect(() => {
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

  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || 'Proje Seçin';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-board-bg">
      {/* 1. Left Sidebar for Projects */}
      <Sidebar />

      {/* 2. Main Board Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                {currentProjectName}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Aktif Çalışma Alanı</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={!currentProjectId}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Yeni Görev
          </button>
        </header>

        {/* Board Columns */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
          {!currentProjectId ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <span className="text-sm">Başlamak için sol menüden bir pano seçin veya yeni bir tane oluşturun.</span>
            </div>
          ) : isLoading && tasks.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 gap-3">
              <Loader className="animate-spin" />
              <span>Görevler yükleniyor...</span>
            </div>
          ) : (
            <div className="flex items-stretch gap-6 h-full min-w-max">
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
      </div>

      {/* 3. Right Activity Log Panel */}
      <ActivityLogPanel />

      {isModalOpen && (
        <NewTaskModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default TaskBoard;
