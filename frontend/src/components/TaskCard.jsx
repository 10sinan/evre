import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, Trash2, User } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskDetailsModal from './TaskDetailsModal';

const TaskCard = ({ task }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
    },
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
    transition: isDragging ? 'none' : 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    touchAction: 'none',
    zIndex: isDragging ? 50 : undefined,
  };

  const priorityColor = task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        task.priority === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/30';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setIsDetailsOpen(true)}
        className={`
          relative group flex flex-col gap-3 p-4 rounded-xl border border-slate-700/50
          bg-card-bg shadow-md backdrop-blur-sm transition-all duration-200
          hover:shadow-lg hover:border-slate-600 hover:-translate-y-0.5
          ${isDragging ? 'opacity-50 ring-2 ring-primary shadow-xl scale-105 cursor-grabbing' : 'cursor-grab'}
        `}
      >
        {/* Top Section */}
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-slate-100 font-semibold text-sm leading-tight max-w-[75%] break-words">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Delete Action */}
            <button 
              onClick={handleDelete}
              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Görevi Sil"
            >
              <Trash2 size={13} />
            </button>
            {/* Drag Handle */}
            <div 
              {...attributes} 
              {...listeners} 
              onClick={(e) => e.stopPropagation()} // Prevent modal on handle drag/click
              className="text-slate-500 group-hover:text-slate-400 transition-colors cursor-grab p-1"
            >
              <GripVertical size={14} />
            </div>
          </div>
        </div>
        
        {task.description && (
          <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
        )}

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
      </div>

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
