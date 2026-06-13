import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { LayoutDashboard, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Auth = () => {
  const { login, register } = useTaskStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      if (!isLogin) {
        if (!formData.email.trim()) {
          setError('E-posta alanı zorunludur.');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Şifreler eşleşmiyor.');
          return;
        }
        await register(formData.username, formData.email, formData.password);
      } else {
        await login(formData.username, formData.password);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 403) {
        setError('Giriş bilgileri hatalı veya yetkisiz erişim.');
      } else {
        setError('Bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Glow effects background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        {/* Header logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary mb-1">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Evre</h2>
          <p className="text-sm text-slate-400">Gerçek Zamanlı Görev Yönetimi</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User size={16} className="text-slate-500" />
              Kullanıcı Adı
            </label>
            <input 
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="kullanıcı_adı"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-700"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail size={16} className="text-slate-500" />
                E-posta Adresi
              </label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@evre.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock size={16} className="text-slate-500" />
              Şifre
            </label>
            <input 
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-700"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock size={16} className="text-slate-500" />
                Şifre Tekrar
              </label>
              <input 
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-700"
              />
            </div>
          )}

          <button 
            type="submit"
            className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 cursor-pointer"
          >
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Toggle between login/register */}
        <div className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? (
            <p>
              Hesabınız yok mu?{' '}
              <button 
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Kayıt Olun
              </button>
            </p>
          ) : (
            <p>
              Zaten hesabınız var mı?{' '}
              <button 
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Giriş Yapın
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
