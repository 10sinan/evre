import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Activity, Bell, ChevronRight, ChevronLeft, Clock, Plus, ArrowRight, MessageSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Şimdi';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Şimdi';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return 'Dün';
  return `${diffDay} gün önce`;
};

const getIconForLog = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('oluşturdu') || msg.includes('ekledi')) {
    return { Icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  }
  if (msg.includes('taşıdı') || msg.includes('durumundan')) {
    return { Icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  }
  if (msg.includes('yorum yaptı')) {
    return { Icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' };
  }
  return { Icon: Activity, color: 'text-slate-400', bg: 'bg-slate-800' };
};

const formatLogMessage = (message) => {
  // Bold words inside quotes (like 'Task Title')
  let formatted = message.replace(/'([^']+)'/g, "<span class='font-bold text-slate-200'>'$1'</span>");
  // Assuming the first word is usually the username, make it bold
  const words = formatted.split(' ');
  if (words.length > 0 && !words[0].includes('<span')) {
    words[0] = `<span class='font-bold text-slate-200'>${words[0]}</span>`;
  }
  return <span dangerouslySetInnerHTML={{ __html: words.join(' ') }} />;
};

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
        className="absolute -left-3 top-8 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white p-1 rounded-full shadow-lg transition-colors cursor-pointer z-50"
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4 py-4 text-slate-600">
            <Bell size={18} className="animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {logs.map((log) => {
                const { Icon, color, bg } = getIconForLog(log.message);
                return (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="mb-2"
                  >
                    <div className="p-3 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/30 rounded-xl transition-all flex gap-3 overflow-hidden shadow-sm">
                      <div className={`p-2 rounded-lg flex-shrink-0 self-start ${bg} ${color}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {formatLogMessage(log.message)}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500">
                          <Clock size={10} />
                          <span>{formatRelativeTime(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 mt-10">
                <div className="p-3 bg-slate-800/50 rounded-full mb-3 text-slate-500">
                  <Activity size={24} />
                </div>
                <span className="text-xs text-slate-500 italic">Henüz aktivite kaydedilmedi.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPanel;
