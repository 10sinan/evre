import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Plus, Layout, Folder, ChevronLeft, ChevronRight, LogOut, Loader } from 'lucide-react';

const Sidebar = () => {
  const { 
    projects, 
    currentProjectId, 
    setCurrentProjectId, 
    fetchProjects, 
    createProject,
    user,
    logout
  } = useTaskStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsSubmitting(true);
    try {
      await createProject({ name: newProjectName.trim() });
      setNewProjectName('');
      setShowNewProjectModal(false);
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`
        relative h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-20 flex-shrink-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white p-1 rounded-full shadow-lg transition-colors cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Title / Logo */}
        <div className={`p-6 border-b border-slate-800 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="p-2 bg-primary/20 rounded-xl text-primary flex-shrink-0">
            <Layout size={22} />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-slate-200 text-lg leading-tight tracking-tight">Evre</h2>
              <span className="text-[10px] text-slate-500 font-medium">Panolarım</span>
            </div>
          )}
        </div>

        {/* Create New Project / Board Button */}
        <div className="p-4">
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer
              ${isCollapsed 
                ? 'bg-primary/10 hover:bg-primary/20 text-primary p-2' 
                : 'bg-primary hover:bg-primary-hover text-white px-4 shadow-lg shadow-primary/10'
              }
            `}
          >
            <Plus size={16} />
            {!isCollapsed && <span>Yeni Pano Oluştur</span>}
          </button>
        </div>

        {/* Project Lists */}
        <div className="px-3 py-2 flex flex-col gap-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 mb-2">
              Projeler
            </span>
          )}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setCurrentProjectId(project.id)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer
                ${currentProjectId === project.id 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Folder size={18} className={currentProjectId === project.id ? 'text-primary' : 'text-slate-500'} />
              {!isCollapsed && <span className="truncate">{project.name}</span>}
            </button>
          ))}
          {projects.length === 0 && !isCollapsed && (
            <span className="text-xs text-slate-600 px-3 py-2 italic">Henüz pano yok.</span>
          )}
        </div>
      </div>

      {/* User Info & Logout section */}
      {user && (
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 truncate">{user.username}</span>
                <span className="text-[9px] text-slate-500 truncate">{user.email}</span>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className={`
              w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/25 rounded-lg transition-all cursor-pointer
              ${isCollapsed ? 'p-2 border-none' : ''}
            `}
          >
            <LogOut size={14} />
            {!isCollapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      )}

      {/* Add Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-sm rounded-2xl shadow-2xl p-5">
            <h3 className="text-slate-200 font-semibold text-base mb-4">Yeni Pano Oluştur</h3>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <input 
                type="text"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Pano adı..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-700 text-sm"
              />
              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button 
                  type="button" 
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newProjectName.trim()}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 transition-colors disabled:opacity-55 cursor-pointer"
                >
                  {isSubmitting && <Loader size={12} className="animate-spin" />}
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
