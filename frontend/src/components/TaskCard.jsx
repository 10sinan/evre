import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Clock } from 'lucide-react';

const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  // Modern styling with Tailwind
  const priorityColor = task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative group flex flex-col gap-3 p-4 rounded-xl border border-slate-700/50
        bg-card-bg shadow-md backdrop-blur-sm transition-all duration-200
        hover:shadow-lg hover:border-slate-600 hover:-translate-y-0.5
        ${isDragging ? 'opacity-50 ring-2 ring-primary shadow-xl scale-105 cursor-grabbing' : 'cursor-grab'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-slate-100 font-semibold text-sm leading-tight max-w-[85%]">{task.title}</h4>
        <div className="text-slate-500 group-hover:text-slate-400 transition-colors">
          <GripVertical size={16} />
        </div>
      </div>
      
      {task.description && (
        <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
      )}

      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
        <span className={`text-[10px] font-medium px-2 py-1 rounded-md border ${priorityColor}`}>
          {task.priority || 'NORMAL'}
        </span>
        <div className="flex items-center text-slate-500 text-[10px] gap-1">
          <Clock size={12} />
          <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
