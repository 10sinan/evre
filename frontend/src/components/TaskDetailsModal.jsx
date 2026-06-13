import React, { useEffect, useState, useRef } from 'react';
import { X, Edit2, Check, Loader, User, Calendar, Tag, Layers, CheckSquare, Plus, MessageSquare, Send } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const TaskDetailsModal = ({ task, onClose }) => {
  const { updateTask, addSubTask, toggleSubTask, addComment, users, fetchUsers, user: currentUser } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const commentsEndRef = useRef(null);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority || 'NORMAL',
    assignedToId: task.assignedToId || '',
    deadline: task.deadline ? task.deadline.slice(0, 16) : ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Scroll to bottom of comments when task.comments changes
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task.comments]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        projectId: task.projectId,
        assignedToId: formData.assignedToId === '' ? null : Number(formData.assignedToId),
        deadline: formData.deadline || null
      };
      await updateTask(task.id, payload);
      setIsEditing(false);
    } catch (error) {
      console.error("Task update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      await addSubTask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    } catch (error) {
      console.error("Failed to add subtask", error);
    }
  };

  const handleToggleSubtask = async (subTaskId) => {
    try {
      await toggleSubTask(subTaskId, task.id);
    } catch (error) {
      console.error("Failed to toggle subtask", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;
    try {
      await addComment(task.id, newCommentContent);
      setNewCommentContent('');
    } catch (error) {
      console.error("Failed to add comment", error);
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
        className="bg-card-bg border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
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
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {isEditing ? (
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4 max-w-2xl mx-auto">
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
                rows={3}
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

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Bitiş Tarihi (Deadline)</label>
                <input 
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                />
              </div>
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
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Column (Main Content) */}
            <div className="p-6 flex-1 flex flex-col gap-6 border-r border-slate-700/50">
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

            {/* Checklist Section */}
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-primary" />
                <h4 className="text-sm font-semibold text-slate-200">Alt Görevler</h4>
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                <input 
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Yeni bir alt görev ekle..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
                <button 
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </form>

              {/* Subtasks List */}
              <div className="flex flex-col gap-2">
                {task.subTasks && task.subTasks.length > 0 ? (
                  task.subTasks.map(st => {
                    const isDone = st.completed || st.isCompleted;
                    return (
                      <div 
                        key={st.id} 
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800'}`}
                      >
                        <button 
                          onClick={() => handleToggleSubtask(st.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 border border-slate-600 text-transparent hover:border-slate-500'}`}
                        >
                          <Check size={12} className={isDone ? 'opacity-100' : 'opacity-0'} />
                        </button>
                        <span className={`text-sm flex-1 ${isDone ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                          {st.title}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
                    <span className="text-xs text-slate-500 italic">Henüz alt görev eklenmemiş.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-4 border-t border-slate-700/50 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-primary" />
                <h4 className="text-sm font-semibold text-slate-200">Yorumlar</h4>
              </div>

              {/* Comments List */}
              <div className="flex flex-col gap-4 max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map(comment => {
                    const isOwnComment = currentUser && comment.authorId === currentUser.id;
                    const initials = comment.authorUsername ? comment.authorUsername.substring(0, 2).toUpperCase() : 'U';
                    const timeString = new Date(comment.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={comment.id} className={`flex gap-3 ${isOwnComment ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0 border border-slate-700">
                          {initials}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${isOwnComment ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-slate-400">{comment.authorUsername || 'Bilinmeyen'}</span>
                            <span className="text-[9px] text-slate-500">{timeString}</span>
                          </div>
                          <div className={`p-3 rounded-2xl text-sm ${isOwnComment ? 'bg-primary/20 text-slate-200 rounded-tr-sm border border-primary/30' : 'bg-slate-800 text-slate-300 rounded-tl-sm border border-slate-700/50'}`}>
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 bg-slate-900/30 rounded-lg border border-slate-800/50">
                    <MessageSquare size={24} className="mx-auto mb-2 text-slate-600" />
                    <span className="text-xs text-slate-500 italic">Bu görev için henüz yorum yapılmamış. İlk yorumu sen yap!</span>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <textarea
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!newCommentContent.trim()}
                  className="px-4 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-primary shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
            </div>

            {/* Right Column (Sidebar properties) */}
            <div className="w-full md:w-80 p-6 bg-slate-900/30 flex flex-col gap-6 flex-shrink-0">
              <div className="flex flex-col gap-6">
                {/* Status */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">DURUM</span>
                  <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <Tag size={16} />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{statusLabel(task.status)}</span>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">ÖNCELİK</span>
                  <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${priorityColor(task.priority)}`}>
                      {task.priority || 'NORMAL'}
                    </span>
                  </div>
                </div>

                {/* Assigned User */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">ATANAN KİŞİ</span>
                  <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col">
                      {assignedUser ? (
                        <>
                          <span className="text-xs font-semibold text-primary">{assignedUser.username}</span>
                          <span className="text-[10px] text-slate-500">{assignedUser.email}</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Atanmamış</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                {task.deadline && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">BİTİŞ TARİHİ (DEADLINE)</span>
                    <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                        <Calendar size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        {new Date(task.deadline).toLocaleString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
