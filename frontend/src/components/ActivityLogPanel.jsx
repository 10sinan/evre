import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Activity, Bell, ChevronRight, ChevronLeft, Clock } from 'lucide-react';

const ActivityLogPanel = () => {
  const logs = useTaskStore((state) => state.logs);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`
        relative h-screen bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 z-10 flex-shrink-0
        ${isCollapsed ? 'w-14' : 'w-80'}
      `}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-8 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white p-1 rounded-full shadow-lg transition-colors cursor-pointer"
      >
        {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Header */}
      <div className={`p-5 border-b border-slate-800 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
          <Activity size={20} />
        </div>
        {!isCollapsed && (
          <div>
            <h3 className="font-semibold text-slate-200 text-sm leading-tight">Aktivite Akışı</h3>
            <span className="text-[10px] text-slate-500 font-medium">Anlık bildirimler</span>
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4 py-4 text-slate-600">
            <Bell size={18} className="animate-pulse" />
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-slate-800 transition-all flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <p className="text-xs text-slate-300 leading-normal font-medium">{log.message}</p>
                <div className="flex items-center gap-1 text-[9px] text-slate-500">
                  <Clock size={10} />
                  <span>
                    {log.timestamp 
                      ? new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) 
                      : 'Şimdi'
                    }
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-xs text-slate-600 italic">Henüz aktivite kaydedilmedi.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPanel;
