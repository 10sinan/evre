import React, { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { terminalService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X } from 'lucide-react';

const TerminalConsole = () => {
  const { currentProjectId, isTerminalOpen, toggleTerminal } = useTaskStore();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'response', text: 'Evre Geliştirici Konsoluna (Terminal) Hoş Geldiniz.' },
    { type: 'response', text: "Mevcut komutları görmek için 'help' yazabilirsiniz." },
    { type: 'response', text: "Kapatmak için 'Esc' veya '`' (tilde) tuşuna basabilirsiniz." }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const endOfHistoryRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '`' || e.key === 'é' || e.code === 'Backquote') {
        e.preventDefault();
        toggleTerminal();
      } else if (e.key === 'Escape' && isTerminalOpen) {
        toggleTerminal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalOpen, toggleTerminal]);

  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    if (endOfHistoryRef.current) {
      endOfHistoryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isTerminalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentProjectId) return;

    const commandStr = input.trim();
    setInput('');
    
    // Add command to history
    setHistory(prev => [...prev, { type: 'command', text: commandStr }]);
    
    setIsExecuting(true);
    try {
      const response = await terminalService.executeCommand(commandStr, currentProjectId);
      setHistory(prev => [...prev, { type: 'response', text: response }]);
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Komut çalıştırılamadı.';
      setHistory(prev => [...prev, { type: 'error', text: `HATA: ${errorMsg}` }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 h-80 z-[100] bg-slate-950/95 border-t border-green-500/30 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col font-mono text-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-green-500/20 text-slate-300">
            <div className="flex items-center gap-2 text-xs">
              <Terminal size={14} className="text-green-400" />
              <span>Evre Terminal</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] text-slate-400 ml-2">
                Proje ID: {currentProjectId || 'Seçilmedi'}
              </span>
            </div>
            <button 
              onClick={() => toggleTerminal(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-1 text-slate-300">
            {history.map((line, index) => (
              <div key={index} className="leading-relaxed whitespace-pre-wrap flex gap-2">
                {line.type === 'command' && (
                  <>
                    <span className="text-green-500 flex-shrink-0">evre&gt;</span>
                    <span className="text-white">{line.text}</span>
                  </>
                )}
                {line.type === 'response' && (
                  <span className="text-green-400 pl-4">{line.text}</span>
                )}
                {line.type === 'error' && (
                  <span className="text-red-400 pl-4">{line.text}</span>
                )}
              </div>
            ))}
            {isExecuting && (
              <div className="pl-4 text-slate-500 animate-pulse">Çalıştırılıyor...</div>
            )}
            <div ref={endOfHistoryRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="px-4 py-3 bg-slate-900/50 flex items-center gap-2 border-t border-slate-800">
            <span className="text-green-500 font-bold">evre&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isExecuting || !currentProjectId}
              placeholder={currentProjectId ? "Bir komut yazın (Örn: create task \"Frontend Tasarımı\")" : "Lütfen önce bir proje seçin"}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-600 focus:ring-0 disabled:opacity-50"
              autoComplete="off"
              spellCheck="false"
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalConsole;
