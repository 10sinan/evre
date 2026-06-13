import React, { useEffect, useState } from 'react';
import { X, Edit2, Check, Loader, User, Calendar, Tag, Layers } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const TaskDetailsModal = ({ task, onClose }) => {
  const { updateTask, users, fetchUsers } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority || 'NORMAL',
    assignedToId: task.assignedToId || ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        projectId: task.projectId,
        assignedToId: formData.assignedToId === '' ? null : Number(formData.assignedToId)
      };
      await updateTask(task.id, payload);
      setIsEditing(false);
    } catch (error) {
      console.error("Task update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  const assignedUser = users.find(u => u.id === (isEditing ? formData.assignedToId : task.assignedToId));

  const priorityColor = (p) => p === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                               p === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                               p === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                               'bg-slate-500/20 text-slate-400 border-slate-500/30';

  const statusLabel = (s) => s === 'TODO' ? 'Yapılacak' :
                             s === 'IN_PROGRESS' ? 'Devam Ediyor' :
                             'Tamamlandı';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div 
        className="bg-card-bg border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/30">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            Görev Detayları
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                <Edit2 size={14} />
                Düzenle
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isEditing ? (
          <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Başlık *</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Açıklama</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Durum</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                >
                  <option value="TODO">Yapılacak</option>
                  <option value="IN_PROGRESS">Devam Ediyor</option>
                  <option value="DONE">Tamamlandı</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Öncelik</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="LOW">Düşük</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Görevin Atanacağı Üye</label>
              <select 
                value={formData.assignedToId}
                onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
              >
                <option value="">Seçilmedi (Atanmamış)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm cursor-pointer"
              >
                İptal
              </button>
              <button 
                type="submit"
                disabled={isSaving || !formData.title.trim()}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50 text-sm cursor-pointer"
              >
                {isSaving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 flex flex-col gap-6">
            {/* Title */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">GÖREV BAŞLIĞI</span>
              <h3 className="text-xl font-bold text-slate-100">{task.title}</h3>
            </div>

            {/* Description */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">AÇIKLAMA</span>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
                {task.description || <span className="text-slate-500 italic">Açıklama belirtilmemiş.</span>}
              </p>
            </div>

            {/* Grid properties */}
            <div className="grid grid-cols-2 gap-6 bg-slate-900/20 p-4 rounded-xl border border-slate-800/60">
              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <Tag size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">DURUM</span>
                  <span className="text-xs font-semibold text-slate-200">{statusLabel(task.status)}</span>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">ÖNCELİK</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${priorityColor(task.priority)}`}>
                    {task.priority || 'NORMAL'}
                  </span>
                </div>
              </div>

              {/* Assigned User */}
              <div className="col-span-2 flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <User size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">ATANAN KİŞİ</span>
                  {assignedUser ? (
                    <span className="text-xs font-semibold text-primary">
                      {assignedUser.username} <span className="text-[10px] text-slate-500">({assignedUser.email})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Atanmamış</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsModal;
