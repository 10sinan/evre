import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import NewTaskModal from './NewTaskModal';
import Sidebar from './Sidebar';
import ActivityLogPanel from './ActivityLogPanel';
import AnalyticsView from './AnalyticsView';
import MyTasksView from './MyTasksView';
import TerminalConsole from './TerminalConsole';
import { useTaskStore } from '../store/useTaskStore';
import { Plus, LayoutDashboard, Loader, Search } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = [
  { id: 'TODO', title: 'Yapılacaklar' },
  { id: 'IN_PROGRESS', title: 'Devam Edenler' },
  { id: 'DONE', title: 'Tamamlananlar' }
];

const TaskBoard = () => {
  const { 
    updateTaskStatus, 
    connectWebSocket, 
    disconnectWebSocket, 
    isLoading, 
    currentProjectId,
    projects,
    users,
    searchQuery,
    filterAssignee,
    filterPriority,
    setSearchQuery,
    setFilterAssignee,
    setFilterPriority,
    getFilteredTasks,
    activeView
  } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Computed selector
  const filteredTasks = getFilteredTasks();

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

  const playSound = (type = 'pickup') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'pickup') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'drop') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      // Ignore audio context errors
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(active.data.current?.task ?? null);
    playSound('pickup');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    playSound('drop');
    
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id; // column id
    const task = active.data.current?.task;

    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    playSound('drop');
  };

  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || 'Proje Seçin';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-board-bg">
      {/* 1. Left Sidebar for Projects */}
      <Sidebar />

      {/* 2. Main Board Content */}
      {activeView === 'analytics' ? (
        <AnalyticsView />
      ) : activeView === 'mytasks' ? (
        <MyTasksView />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300">
          {/* Top Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
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
            
            {/* Smart Filters & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Görev ara..."
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 transition-all"
                />
              </div>

              {/* Member Filter */}
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="All">Tüm Üyeler</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="All">Tüm Öncelikler</option>
                <option value="HIGH">Yüksek</option>
                <option value="MEDIUM">Orta</option>
                <option value="LOW">Düşük</option>
                <option value="NORMAL">Normal</option>
              </select>

              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={!currentProjectId}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Yeni Görev
              </button>
            </div>
          </header>

          {/* Board Columns */}
          <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
            <AnimatePresence mode="wait">
              {!currentProjectId ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2"
                >
                  <span className="text-sm">Başlamak için sol menüden bir pano seçin veya yeni bir tane oluşturun.</span>
                </motion.div>
              ) : isLoading && filteredTasks.length === 0 && searchQuery === '' && filterAssignee === 'All' && filterPriority === 'All' ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex items-center justify-center text-slate-400 gap-3"
                >
                  <Loader className="animate-spin" />
                  <span>Görevler yükleniyor...</span>
                </motion.div>
              ) : (
                  <motion.div 
                    key={currentProjectId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-stretch gap-4 md:gap-6 h-full"
                  >
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                  >
                    {COLUMNS.map(column => (
                      <TaskColumn 
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        tasks={filteredTasks.filter(t => t.status === column.id)}
                      />
                    ))}

                    {/* ── Drag Overlay: "held in hand" floating card ── */}
                    <DragOverlay dropAnimation={{
                      duration: 220,
                      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                    }}>
                      {activeTask ? (
                        <div
                          style={{
                            transform: 'rotate(-3deg) scale(1.07)',
                            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(99,102,241,0.25)',
                            cursor: 'grabbing',
                            borderRadius: '0.75rem',
                            opacity: 0.97,
                          }}
                        >
                          <TaskCard task={activeTask} isOverlay />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}

      {/* 3. Right Activity Log Panel — hidden in analytics view */}
      {activeView !== 'analytics' && <ActivityLogPanel />}

      {isModalOpen && (
        <NewTaskModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* Terminal Console */}
      <TerminalConsole />
    </div>
  );
};

export default TaskBoard;
