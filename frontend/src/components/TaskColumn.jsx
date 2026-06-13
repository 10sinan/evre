import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const TaskColumn = ({ id, title, tasks }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // Modern subtle indicators based on column type
  const columnColors = {
    'TODO': 'border-blue-500/30 bg-blue-500/5',
    'IN_PROGRESS': 'border-yellow-500/30 bg-yellow-500/5',
    'DONE': 'border-emerald-500/30 bg-emerald-500/5'
  };

  const badgeColors = {
    'TODO': 'bg-blue-500/20 text-blue-400',
    'IN_PROGRESS': 'bg-yellow-500/20 text-yellow-400',
    'DONE': 'bg-emerald-500/20 text-emerald-400'
  };

  return (
    <div className="flex flex-col h-full flex-1 min-w-[280px] max-w-sm rounded-2xl bg-column-bg border border-slate-700/50 shadow-lg overflow-hidden transition-all duration-300">
      {/* Column Header */}
      <div className={`p-4 border-b border-slate-700/50 flex items-center justify-between ${columnColors[id]}`}>
        <h3 className="font-semibold text-slate-200 tracking-wide">{title}</h3>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[id]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto flex flex-col gap-3 transition-colors duration-200 ${isOver ? 'bg-slate-700/30' : ''}`}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl m-2 opacity-50">
            <span className="text-sm text-slate-400">Buraya sürükleyin</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
