import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useTaskStore } from '../store/useTaskStore';
import { analyticsService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, CheckCircle2, ListTodo, Users, RefreshCcw, AlertCircle } from 'lucide-react';

// ─── Colour Theme ──────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  TODO:        '#6366f1', // indigo
  IN_PROGRESS: '#f59e0b', // amber
  DONE:        '#10b981', // emerald
};

const BAR_COLOR = '#7c3aed';

// ─── Recharts Custom Tooltip ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 shadow-xl text-xs text-slate-200">
      {label && <p className="font-semibold text-slate-100 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="flex-1 min-w-[160px] bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3 hover:border-slate-700 transition-colors"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-100">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AnalyticsView = () => {
  const { currentProjectId, projects } = useTaskStore();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const projectName = projects.find(p => p.id === currentProjectId)?.name ?? 'Proje';

  const fetchAnalytics = useCallback(async () => {
    if (!currentProjectId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getProjectAnalytics(currentProjectId);
      setData(result);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('İstatistikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Derived values ────────────────────────────────────────────────────────
  const totalTasks      = data?.totalTasks ?? 0;
  const statusCounts    = data?.statusCounts ?? {};
  const userTaskCounts  = data?.userTaskCounts ?? {};

  const doneTasks       = statusCounts['DONE'] ?? 0;
  const completionRate  = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const activeUsers     = Object.keys(userTaskCounts).length;

  // Pie data
  const pieData = Object.entries(statusCounts).map(([key, val]) => ({
    name: key === 'TODO' ? 'Yapılacak' : key === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Tamamlandı',
    value: val,
    key,
  }));

  // Bar data
  const barData = Object.entries(userTaskCounts).map(([user, count]) => ({
    name: user,
    Görev: count,
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-board-bg">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
            <BarChart2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">İstatistikler</h1>
            <p className="text-[10px] text-slate-500 font-medium">{projectName}</p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </header>

      <AnimatePresence mode="wait">
        {/* No project selected */}
        {!currentProjectId && (
          <motion.div
            key="no-project"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 p-8"
          >
            <BarChart2 size={40} className="opacity-30" />
            <p className="text-sm">İstatistikleri görüntülemek için sol menüden bir pano seçin.</p>
          </motion.div>
        )}

        {/* Error */}
        {currentProjectId && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3 p-8"
          >
            <AlertCircle size={36} />
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Tekrar dene
            </button>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {currentProjectId && loading && !data && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <RefreshCcw size={28} className="animate-spin text-violet-500" />
              <span className="text-sm">Veriler yükleniyor...</span>
            </div>
          </motion.div>
        )}

        {/* Main content */}
        {currentProjectId && !error && data && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-8 flex flex-col gap-8"
          >
            {/* ── Metric Cards ── */}
            <div className="flex flex-wrap gap-4">
              <MetricCard
                icon={ListTodo}
                label="Toplam Görev"
                value={totalTasks}
                color="bg-indigo-500/20 text-indigo-400"
                delay={0}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Tamamlanma Oranı (%)"
                value={`${completionRate}%`}
                color="bg-emerald-500/20 text-emerald-400"
                delay={0.08}
              />
              <MetricCard
                icon={Users}
                label="Aktif Çalışan Sayısı"
                value={activeUsers}
                color="bg-amber-500/20 text-amber-400"
                delay={0.16}
              />
            </div>

            {/* ── Charts Row ── */}
            <div className="flex flex-wrap gap-6">

              {/* Pie Chart — Status Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="flex-1 min-w-[300px] bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-1">Durum Dağılımı</h2>
                <p className="text-xs text-slate-500 mb-5">Görevlerin tamamlanma durumlarına göre dağılımı</p>
                {pieData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-600 text-xs italic">
                    Henüz görev yok.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={STATUS_COLORS[entry.key] ?? '#94a3b8'}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span className="text-xs text-slate-400">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Bar Chart — User Task Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.28 }}
                className="flex-1 min-w-[300px] bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-1">Üye Başına Görev</h2>
                <p className="text-xs text-slate-500 mb-5">Her takım üyesine atanmış görev sayısı</p>
                {barData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-600 text-xs italic">
                    Henüz atama yok.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
                      <Bar dataKey="Görev" fill={BAR_COLOR} radius={[6, 6, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </div>

            {/* ── Raw Stats Table (bonus) ── */}
            {barData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-4">Üye Detayları</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
                        <th className="pb-3 font-semibold">Kullanıcı</th>
                        <th className="pb-3 font-semibold text-right">Atanan Görev</th>
                        <th className="pb-3 font-semibold text-right">Oran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barData
                        .sort((a, b) => b['Görev'] - a['Görev'])
                        .map((row, idx) => (
                          <tr
                            key={row.name}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 text-slate-200 font-medium flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[10px]">
                                {row.name.charAt(0).toUpperCase()}
                              </span>
                              {row.name}
                            </td>
                            <td className="py-3 text-slate-300 text-right">{row['Görev']}</td>
                            <td className="py-3 text-right">
                              <span className="text-violet-400 font-semibold">
                                {totalTasks > 0 ? `${Math.round((row['Görev'] / totalTasks) * 100)}%` : '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsView;
