import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Loader, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModal';

const MyTasksView = () => {
  const { myTasks, fetchMyTasks, projects, isLoading, updateTaskStatus } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Bilinmeyen Proje';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock size={18} className="text-blue-500" />;
      default: return <AlertCircle size={18} className="text-slate-500" />;
    }
  };

  const handleStatusToggle = (e, task) => {
    e.stopPropagation();
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateTaskStatus(task.id, newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-board-bg">
        <Loader size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-board-bg overflow-hidden relative">
      <div className="p-8 border-b border-slate-800/50 bg-slate-900/50 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Bana Atanan Görevler</h1>
        <p className="text-slate-400 text-sm">Tüm projelerinizdeki üzerinize atanmış görevlerin listesi.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {myTasks.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800/50">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500/50" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">Harika iş!</h3>
              <p className="text-slate-500 text-sm">Şu an üzerine atanmış bekleyen bir görev bulunmuyor.</p>
            </div>
          ) : (
            myTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleTaskClick(task)}
                className="bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 flex items-center gap-6 transition-all cursor-pointer group"
              >
                <div 
                  className="flex-shrink-0 cursor-pointer p-2 rounded-full hover:bg-slate-700 transition-colors"
                  onClick={(e) => handleStatusToggle(e, task)}
                >
                  {getStatusIcon(task.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority || 'NORMAL'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {getProjectName(task.projectId)}
                    </span>
                  </div>
                  <h3 className={`text-base font-semibold truncate ${task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </h3>
                </div>

                {task.deadline && (
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 flex-shrink-0">
                    <Calendar size={14} />
                    <span>
                      {new Date(task.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isDetailsOpen && selectedTask && (
        <TaskDetailsModal 
          task={myTasks.find(t => t.id === selectedTask.id) || selectedTask} 
          onClose={() => setIsDetailsOpen(false)} 
        />
      )}
    </div>
  );
};

export default MyTasksView;
