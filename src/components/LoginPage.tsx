import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  ArrowRight,
  KeyRound,
  AlertCircle,
  X,
  HelpCircle,
  UserPlus,
  Mail,
  Phone,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { User as UserType, Role } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType, rememberMe?: boolean) => void;
  usersList: UserType[];
  onRegisterUser?: (newUser: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, usersList, onRegisterUser }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('Admin');
  const [regDepartment, setRegDepartment] = useState('Department of Accounting & Finance');
  const [regPhone, setRegPhone] = useState('');

  // Live Date & Time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const cleanInput = username.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      // Look up user in provided usersList or query /api/users
      // Search in memory usersList
      let matchedUser = usersList.find(
        (u) =>
          u.email.toLowerCase() === cleanInput ||
          u.id.toLowerCase() === cleanInput ||
          (u.phone && u.phone.includes(cleanInput))
      );

      // System Admin default entry point
      if (!matchedUser && (cleanInput === 'admin' || cleanInput === 'admin@cktcollege.edu.in' || cleanInput === 'u-admin')) {
        matchedUser = usersList.find((u) => u.role === 'Admin') || {
          id: 'u-admin',
          name: 'Dr. S. K. Patil (Principal & System Admin)',
          email: 'admin@cktcollege.edu.in',
          role: 'Admin',
          departmentId: 'dept-admin',
          departmentName: 'Central Administration',
          phone: '+91 98201 12233',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          password: 'admin',
          isActive: true,
          createdAt: new Date().toISOString().substring(0, 10),
        };
      }

      // Try fetching users directly from server endpoint
      if (!matchedUser) {
        try {
          const res = await fetch('/api/users');
          if (res.ok) {
            const fetchedUsers: UserType[] = await res.json();
            matchedUser = fetchedUsers.find(
              (u) =>
                u.email.toLowerCase() === cleanInput ||
                u.id.toLowerCase() === cleanInput ||
                (u.phone && u.phone.includes(cleanInput))
            );
          }
        } catch (err) {
          // Ignore network error
        }
      }

      // Fallback: Check if student profile exists in /api/students
      if (!matchedUser) {
        try {
          const res = await fetch('/api/students');
          if (res.ok) {
            const fetchedStudents: any[] = await res.json();
            const matchedStudent = fetchedStudents.find(
              (s) =>
                (s.email && s.email.toLowerCase() === cleanInput) ||
                (s.studentId && s.studentId.toLowerCase() === cleanInput) ||
                (s.rollNumber && s.rollNumber.toLowerCase() === cleanInput) ||
                (s.mobile && s.mobile.includes(cleanInput))
            );
            if (matchedStudent) {
              matchedUser = {
                id: `u-${matchedStudent.id}`,
                name: matchedStudent.fullName,
                email: matchedStudent.email || `${matchedStudent.studentId.toLowerCase()}@cktcollege.edu.in`,
                role: 'Student',
                linkedStudentId: matchedStudent.id,
                departmentId: matchedStudent.departmentId || 'dept-af',
                departmentName: matchedStudent.departmentName || 'Department of Accounting & Finance',
                phone: matchedStudent.mobile || '+91 98000 00000',
                avatar: matchedStudent.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                password: matchedStudent.password || 'student',
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0],
              };
            }
          }
        } catch (err) {
          // Ignore network error
        }
      }

      // Fallback: Check if faculty profile exists in /api/faculty
      if (!matchedUser) {
        try {
          const res = await fetch('/api/faculty');
          if (res.ok) {
            const fetchedFaculty: any[] = await res.json();
            const matchedFac = fetchedFaculty.find(
              (f) =>
                (f.email && f.email.toLowerCase() === cleanInput) ||
                (f.facultyId && f.facultyId.toLowerCase() === cleanInput) ||
                (f.id && f.id.toLowerCase() === cleanInput)
            );
            if (matchedFac) {
              matchedUser = {
                id: matchedFac.id,
                name: matchedFac.fullName,
                email: matchedFac.email || `${matchedFac.id}@cktcollege.edu.in`,
                role: matchedFac.designation === 'HOD' ? 'HOD' : 'Faculty',
                departmentId: matchedFac.departmentId || 'dept-af',
                departmentName: matchedFac.departmentName || 'Department of Accounting & Finance',
                phone: matchedFac.mobile || '+91 98000 00000',
                password: 'faculty',
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0],
              };
            }
          }
        } catch (err) {
          // Ignore
        }
      }

      if (matchedUser) {
        if (matchedUser.password && cleanPass && matchedUser.password !== cleanPass) {
          setIsLoading(false);
          setErrorMessage('Invalid password. Please check your password and try again.');
          return;
        }
        setIsLoading(false);
        onLoginSuccess(matchedUser, rememberMe);
      } else {
        setIsLoading(false);
        setErrorMessage('User account not found. Verify email/username or log in as admin@cktcollege.edu.in.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('An error occurred during authentication. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!regName || !regEmail || !regPassword) {
      setIsLoading(false);
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const userId = `u-${Date.now()}`;
    const newUser: UserType = {
      id: userId,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      role: 'Admin', // Self-registration strictly restricted to Admin
      departmentId: 'dept-af',
      departmentName: regDepartment,
      phone: regPhone.trim() || '+91 98000 00000',
      password: regPassword.trim(),
      isActive: true,
      createdAt: new Date().toISOString().substring(0, 10),
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    try {
      // Save via API
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      } catch (err) {
        // Ignore API fallback error
      }

      if (onRegisterUser) {
        onRegisterUser(newUser);
      }

      setIsLoading(false);
      setSuccessMessage(`Account for ${newUser.name} (${newUser.role}) successfully created in database! Logging you in...`);
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Failed to register account: ' + err.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans text-slate-900 bg-slate-950 select-none">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.shiksha.com/mediadata/images/1758533993phpUvaluL.jpeg"
          alt="CHANGU KANA THAKUR ARTS, COMMERCE & SCIENCE COLLEGE Campus"
          className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.05]"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/65 to-blue-950/75 backdrop-blur-[2px]" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400 font-black text-xs">
              CKT
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              JBSPS's CHANGU KANA THAKUR ARTS, COMMERCE & SCIENCE COLLEGE (EMPOWERED AUTONOMOUS)
            </h2>
            <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Accredited A++ Grade by NAAC (CGPA-3.52)
            </p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-3 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full backdrop-blur-md text-white text-xs">
          <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-slate-200 hidden sm:inline">{formattedDate}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="font-bold text-amber-300">{formattedTime}</span>
          </div>
        </div>
      </header>

      {/* Main Form Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 opacity-30 blur-xl" />

            <div className="relative bg-slate-900/85 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
              {/* Logo Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-b from-blue-600 via-indigo-700 to-slate-900 p-1 shadow-xl shadow-blue-900/40 border border-amber-400/40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
                      <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                      <circle cx="50" cy="50" r="41" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
                      <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50 M23 23 L29 29 M71 71 L77 77 M23 77 L29 71 M71 29 L77 23" stroke="#f59e0b" strokeWidth="1.5" />
                      <path d="M32 30 L68 30 L68 55 C68 68 50 78 50 78 C50 78 32 68 32 55 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1.5" />
                      <path d="M38 48 C42 45 48 45 50 48 C52 45 58 45 62 48 L62 58 C58 55 52 55 50 58 C48 55 42 55 38 58 Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1" />
                      <line x1="50" y1="48" x2="50" y2="58" stroke="#1d4ed8" strokeWidth="1" />
                      <path d="M50 34 C48 37 48 40 50 42 C52 40 52 37 50 34 Z" fill="#f59e0b" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-1 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-amber-300 shadow">
                    EMPOWERED AUTONOMOUS
                  </span>
                </div>

                <span className="text-amber-400 font-extrabold text-[11px] tracking-wider uppercase mb-0.5">
                  Janardan Bhagat Shikshan Prasarak Sanstha's
                </span>
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-snug max-w-md">
                  Changu Kana Thakur Arts, Commerce & Science College, New Panvel
                </h1>

                <div className="mt-4 pt-3 border-t border-white/10 w-full text-center">
                  <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-amber-300 tracking-tight">
                    College Attendance ERP
                  </h2>
                  <p className="text-xs font-semibold text-blue-300 tracking-wide mt-0.5 uppercase">
                    Department of Accounting & Finance
                  </p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-slate-950/80 p-1 rounded-xl mb-5 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    !isRegisterMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    isRegisterMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Account</span>
                </button>
              </div>

              {/* Messages */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </motion.div>
              )}

              {/* Form Content */}
              {!isRegisterMode ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                        Username / Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g., admin@cktcollege.edu.in or admin"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPasswordModal(true)}
                          className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-xs text-slate-300 font-medium group-hover:text-white transition">
                          Keep me logged in
                        </span>
                      </label>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        256-bit SSL Encrypted
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to ERP Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
              ) : (
                /* Account Registration Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g., Dr. Rajesh Sharma"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g., rsharma@cktcollege.edu.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Account Creation Hierarchy Policy Notice */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-amber-300">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>ERP Registration Policy Matrix:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-300 pl-0.5">
                      <li><strong>Admin:</strong> Self-registers directly on this portal.</li>
                      <li><strong>HOD:</strong> Added exclusively by Admin inside ERP Settings.</li>
                      <li><strong>Faculty & Students:</strong> Added by Admin or HOD in ERP.</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Role (Self-Registration)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled
                          value="Admin"
                          className="w-full px-3 py-2.5 bg-slate-950/90 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 cursor-not-allowed"
                        />
                        <span className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold uppercase border border-amber-500/30">
                          Locked
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98200 00000"
                          className="w-full pl-8 pr-3 py-2.5 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="Department of Accounting & Finance"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Set strong password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/20 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-[0.98] transition flex items-center justify-center space-x-2 disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering in Firestore...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Save Account to Database</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative"
            >
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ERP Password Recovery</h3>
                  <p className="text-xs text-slate-400">Department of Accounting & Finance</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Password resets for CKT College ERP are managed centrally by the Department Admin and HOD Office. If you have forgotten your password or need your login credentials re-issued, please reach out to the department desk:
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-white/10 space-y-2 text-xs mb-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department Desk:</span>
                  <span className="font-semibold text-blue-300">HOD Office (Dept. of Accounting & Finance)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Helpdesk Email:</span>
                  <span className="font-mono text-amber-300">hod.af@cktcollege.edu.in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Campus Extension:</span>
                  <span className="font-mono text-emerald-400">+91 22 2745 5760 (Ext. 204)</span>
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/20 text-[11px] text-blue-200 flex items-start gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Contact your system administrator or Head of Department to generate new credentials.</span>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
              >
                Close Recovery Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Footer */}
      <footer className="relative z-10 w-full py-4 px-6 border-t border-white/10 bg-slate-950/60 backdrop-blur-md text-center text-slate-400 text-xs font-medium space-y-1">
        <p className="tracking-wide">
          © 2026 JBSPS – CHANGU KANA THAKUR ARTS, COMMERCE & SCIENCE COLLEGE, NEW PANVEL (EMPOWERED AUTONOMOUS)
        </p>
        <p className="text-[11px] text-slate-500">
          College Attendance ERP • Department of Accounting & Finance • Production System
        </p>
      </footer>
    </div>
  );
};
