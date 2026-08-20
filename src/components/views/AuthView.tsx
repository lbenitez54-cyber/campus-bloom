import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { AuthUser } from '../../types';

interface AuthViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [career, setCareer] = useState<string>('Medicina');
  const [university, setUniversity] = useState<string>('Facultad de Ciencias Médicas - UNCA');

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Demo Accounts
  const DEMO_USERS: AuthUser[] = [
    {
      id: 'demo-liz',
      name: 'Liz Benítez',
      email: 'lbenitez54@fcmunca.edu.py',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813624-9b5961e6878c?auto=format&fit=crop&q=80&w=400',
      career: 'Medicina • 5to Año',
      university: 'Facultad de Ciencias Médicas - UNCA',
      createdAt: '2026-01-15',
    },
    {
      id: 'demo-guest',
      name: 'Dr. Lucas Galeano',
      email: 'lgaleano@fcmunca.edu.py',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      career: 'Medicina • Internado Rotatorio',
      university: 'Facultad de Ciencias Médicas - UNCA',
      createdAt: '2026-02-10',
    },
  ];

  const handleQuickLogin = (demoUser: AuthUser) => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      // Save in registered users if not present
      try {
        const raw = localStorage.getItem('campusbloom_registered_users');
        const users: AuthUser[] = raw ? JSON.parse(raw) : [];
        if (!users.some((u) => u.email.toLowerCase() === demoUser.email.toLowerCase())) {
          users.push(demoUser);
          localStorage.setItem('campusbloom_registered_users', JSON.stringify(users));
        }
      } catch (err) {
        console.error('Storage error', err);
      }
      onLoginSuccess(demoUser);
      setIsLoading(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const raw = localStorage.getItem('campusbloom_registered_users');
        const users: AuthUser[] = raw ? JSON.parse(raw) : [...DEMO_USERS];

        if (tab === 'login') {
          // Find user or create seamlessly if it matches demo format
          let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

          if (!existing) {
            // If user doesn't exist, create automatically for friendly frictionless access
            existing = {
              id: `user-${Date.now()}`,
              name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              email: cleanEmail,
              career: 'Medicina • Ciclo Clínico',
              university: 'Facultad de Ciencias Médicas - UNCA',
              createdAt: new Date().toISOString().split('T')[0],
            };
            users.push(existing);
            localStorage.setItem('campusbloom_registered_users', JSON.stringify(users));
          }

          onLoginSuccess(existing);
        } else {
          // Register Flow
          if (!name.trim()) {
            setErrorMessage('Por favor escribe tu nombre completo.');
            setIsLoading(false);
            return;
          }

          const alreadyRegistered = users.find((u) => u.email.toLowerCase() === cleanEmail);
          if (alreadyRegistered) {
            // Log in directly with message
            setSuccessMessage('¡Cuenta ya existente! Iniciando sesión...');
            setTimeout(() => {
              onLoginSuccess(alreadyRegistered);
            }, 600);
            return;
          }

          const newUser: AuthUser = {
            id: `user-${Date.now()}`,
            name: name.trim(),
            email: cleanEmail,
            career: `${career.trim()} • Ciclo Clínico`,
            university: university.trim() || 'Facultad de Ciencias Médicas - UNCA',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            createdAt: new Date().toISOString().split('T')[0],
          };

          users.push(newUser);
          localStorage.setItem('campusbloom_registered_users', JSON.stringify(users));

          setSuccessMessage('¡Cuenta creada con éxito! Bienvenido a CampusBloom.');
          setTimeout(() => {
            onLoginSuccess(newUser);
          }, 600);
        }
      } catch (err) {
        console.error('Auth error', err);
        setErrorMessage('Ocurrió un error inesperado al procesar tu cuenta.');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white p-6 sm:p-9 shadow-2xl shadow-[#864e5a]/15 flex flex-col gap-6 relative overflow-hidden"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#ffd9df]/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#cde9ac]/40 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#4e6535] shadow-lg shadow-[#4e6535]/30 border-2 border-white flex items-center justify-center text-white mb-1">
            <HeartPulse className="w-8 h-8 text-[#cde9ac] animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1b1c1c]">
              Campus<span className="text-[#864e5a]">Bloom</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#ffd9df] text-[#783e4c] border border-[#ffccd5]">
              FCM • UNCA
            </span>
          </div>

          {/* Academic Motivational Quote */}
          <div className="px-3 py-1.5 rounded-2xl bg-[#fcf8f8] border border-[#ffd9df]/60 max-w-md">
            <p className="text-xs italic text-[#514345] leading-relaxed">
              "Florece en cada paso de tu trayectoria académica. Transforma la vocación y la disciplina en tu mayor excelencia médica."
            </p>
          </div>
        </div>

        {/* Tab Switcher: Iniciar Sesión / Crear Cuenta */}
        <div className="flex p-1.5 rounded-2xl bg-black/[0.04] border border-black/5 relative">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'bg-white text-[#1b1c1c] shadow-sm shadow-[#864e5a]/10 font-extrabold'
                : 'text-[#514345] hover:text-[#1b1c1c]'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${tab === 'login' ? 'text-[#864e5a]' : 'text-[#837375]'}`} />
            <span>Iniciar Sesión</span>
          </button>

          <button
            id="auth-tab-register"
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'bg-white text-[#1b1c1c] shadow-sm shadow-[#864e5a]/10 font-extrabold'
                : 'text-[#514345] hover:text-[#1b1c1c]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${tab === 'register' ? 'text-[#4e6535]' : 'text-[#837375]'}`} />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab] flex items-center gap-2 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-[#cde9ac] text-[#374d20] border border-[#b4cf95] flex items-center gap-2 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {tab === 'register' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <label className="text-xs font-bold text-[#514345] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#864e5a]" />
                <span>Nombre Completo:</span>
              </label>
              <input
                id="auth-input-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Dra. Liz Benítez"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] border border-black/10 text-sm font-medium text-[#1b1c1c] placeholder:text-[#837375] focus:bg-white focus:ring-2 focus:ring-[#864e5a]/25 focus:border-[#864e5a] outline-none transition-all"
              />
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#514345] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#864e5a]" />
              <span>Correo Electrónico (Institucional o Personal):</span>
            </label>
            <input
              id="auth-input-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@fcmunca.edu.py"
              className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] border border-black/10 text-sm font-medium text-[#1b1c1c] placeholder:text-[#837375] focus:bg-white focus:ring-2 focus:ring-[#864e5a]/25 focus:border-[#864e5a] outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#514345] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#864e5a]" />
              <span>Contraseña:</span>
            </label>
            <div className="relative">
              <input
                id="auth-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-black/[0.03] border border-black/10 text-sm font-medium text-[#1b1c1c] placeholder:text-[#837375] focus:bg-white focus:ring-2 focus:ring-[#864e5a]/25 focus:border-[#864e5a] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#837375] hover:text-[#1b1c1c] p-1"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#514345] flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-[#4e6535]" />
                  <span>Carrera:</span>
                </label>
                <input
                  type="text"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="Medicina"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium text-[#1b1c1c] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#514345] flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#4e6535]" />
                  <span>Facultad:</span>
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="FCM - UNCA"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium text-[#1b1c1c] outline-none"
                />
              </div>
            </motion.div>
          )}

          {/* Submit Action Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#4e6535] to-[#3d5029] hover:from-[#43572d] hover:to-[#334322] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4e6535]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{tab === 'login' ? 'Entrar a CampusBloom' : 'Crear Mi Cuenta y Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="pt-2 border-t border-black/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#864e5a]">
            <span>Accesos Rápidos de Prueba (1 Clic)</span>
            <Sparkles className="w-3 h-3 text-[#864e5a]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickLogin(user)}
                className="p-2.5 rounded-2xl bg-[#ffd9df]/40 hover:bg-[#ffd9df] border border-[#ffccd5] text-left flex items-center gap-2.5 transition-all group shadow-2xs hover:scale-[1.02]"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-xs flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-[#1b1c1c] truncate group-hover:text-[#864e5a]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#514345] truncate font-medium">
                    {user.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center">
          <p className="text-[11px] text-[#514345]/70">
            🔒 <strong>Privacidad Total:</strong> Tus datos, horas de tesis y enlaces se guardan de forma privada e independiente en el almacenamiento seguro de tu dispositivo.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
