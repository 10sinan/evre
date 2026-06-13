import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, Trash2, User, Calendar, CheckSquare } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskDetailsModal from './TaskDetailsModal';
import { motion } from 'framer-motion';

const TaskCard = ({ task, isOverlay = false }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(!isOverlay ? false : false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isOverlay ? `overlay-${task.id}` : task.id,
    disabled: isOverlay,
    data: { task },
  });

  const users = useTaskStore((state) => state.users);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const assignedUser = users.find(u => u.id === task.assignedToId);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      deleteTask(task.id);
    }
  };

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    touchAction: 'none',
  };

  const priorityColor = task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        task.priority === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/30';

  // Compute deadline details for styling card border
  const deadlineDetails = (() => {
    if (!task.deadline) return { isUrgent: false, isPastDue: false };
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const isPastDue = diffMs < 0;
    const isUrgent = !isPastDue && diffHours < 24 && task.status !== 'DONE';
    return { isUrgent, isPastDue };
  })();

  const borderClass = task.status !== 'DONE' && (deadlineDetails.isPastDue || deadlineDetails.isUrgent)
    ? 'border-red-500'
    : 'border-slate-700/50';

  const overlayShadowClass = isOverlay 
    ? (task.priority === 'HIGH' ? 'shadow-[0_0_30px_rgba(239,68,68,0.4)] border-red-500 scale-105 cursor-grabbing z-50' :
       task.priority === 'MEDIUM' ? 'shadow-[0_0_30px_rgba(234,179,8,0.4)] border-yellow-500 scale-105 cursor-grabbing z-50' :
       task.priority === 'LOW' ? 'shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-500 scale-105 cursor-grabbing z-50' :
       'shadow-[0_0_30px_rgba(148,163,184,0.3)] border-slate-400 scale-105 cursor-grabbing z-50')
    : '';

  return (
    <>
      <motion.div
        ref={isOverlay ? undefined : setNodeRef}
        style={isOverlay ? {} : style}
        onClick={() => !isOverlay && setIsDetailsOpen(true)}
        {...(!isOverlay ? attributes : {})}
        {...(!isOverlay ? listeners : {})}
        layoutId={`card-${task.id}`}
        layout
        whileHover={!isDragging && !isOverlay ? { 
          scale: 1.03, 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
          borderColor: task.status !== 'DONE' && (deadlineDetails.isPastDue || deadlineDetails.isUrgent) ? "rgb(239, 68, 68)" : "rgba(100, 116, 139, 0.8)" 
        } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`
          relative group flex flex-col gap-3 p-4 rounded-xl border
          bg-card-bg backdrop-blur-sm
          transition-all duration-200
          ${isDragging 
            ? 'opacity-30 border-dashed border-slate-600 cursor-grabbing scale-95 shadow-none' 
            : isOverlay 
              ? overlayShadowClass 
              : `${borderClass} cursor-grab shadow-md`}
        `}
      >
        {/* Top Section */}
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-slate-100 font-semibold text-sm leading-tight max-w-[85%] break-words">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Delete Action */}
            <button 
              onClick={handleDelete}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer relative z-10"
              title="Görevi Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
        )}

        {/* Subtasks Progress Bar */}
        {task.subTasks && task.subTasks.length > 0 && (() => {
          const total = task.subTasks.length;
          const completed = task.subTasks.filter(st => st.completed || st.isCompleted).length;
          const percentage = Math.round((completed / total) * 100);
          return (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <CheckSquare size={10} />
                  Alt Görevler
                </span>
                <span>{completed}/{total}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${percentage === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })()}

        {/* Footer Info */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${priorityColor}`}>
              {task.priority || 'NORMAL'}
            </span>
            {assignedUser && (
              <div 
                className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md"
                title={`Atanan: ${assignedUser.username}`}
              >
                <User size={10} />
                <span className="max-w-[70px] truncate">{assignedUser.username}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center text-slate-500 text-[9px] gap-1">
            <Clock size={11} />
            <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        {/* Deadline Display */}
        {task.deadline && (() => {
          const deadlineDate = new Date(task.deadline);
          const now = new Date();
          const diffMs = deadlineDate.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          const isPastDue = diffMs < 0;
          const isUrgent = !isPastDue && diffHours < 24 && task.status !== 'DONE';

          const formattedDeadline = deadlineDate.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div className="flex flex-col gap-1.5 mt-1 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-[10px] font-medium ${
                  task.status === 'DONE' 
                    ? 'text-slate-400' 
                    : isPastDue 
                      ? 'text-red-500 font-bold' 
                      : isUrgent 
                        ? 'text-red-400 font-bold animate-pulse' 
                        : 'text-slate-400'
                }`}>
                  <Calendar size={11} />
                  <span>Bitiş: {formattedDeadline}</span>
                </div>
                {isPastDue && task.status !== 'DONE' && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse">
                    Süresi Geçti
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </motion.div>

      {isDetailsOpen && (
        <TaskDetailsModal 
          task={task} 
          onClose={() => setIsDetailsOpen(false)} 
        />
      )}
    </>
  );
};

export default TaskCard;
