import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const NewTaskModal = ({ onClose }) => {
  const { createTask } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'NORMAL'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask(formData);
      onClose();
    } catch (error) {
      console.error("Task creation failed", error);
      // Hata gösterimi eklenebilir
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div 
        className="bg-card-bg border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/30">
          <h2 className="text-lg font-semibold text-slate-100">Yeni Görev Ekle</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Başlık *</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Görev başlığı..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Açıklama</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detaylar..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Durum</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
              >
                <option value="TODO">Yapılacak</option>
                <option value="IN_PROGRESS">Devam Ediyor</option>
                <option value="DONE">Tamamlandı</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Öncelik</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Yüksek</option>
                <option value="LOW">Düşük</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isSubmitting && <Loader size={16} className="animate-spin" />}
              {isSubmitting ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
