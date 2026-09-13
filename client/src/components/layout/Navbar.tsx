import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  FileText,
  ShieldCheck,
  Shield,
  LogOut,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../notifications/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse', path: '/items', icon: Search },
    { name: 'Report', path: '/report', icon: PlusCircle },
    { name: 'My Reports', path: '/my-reports', icon: FileText },
    { name: 'Claims', path: '/my-claims', icon: ShieldCheck },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
  ];

  const cycleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? 'bg-earth-50/70 dark:bg-earth-950/70 backdrop-blur-3xl backdrop-saturate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(212,175,55,0.03)] border-b border-earth-200/50 dark:border-earth-800/50 py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* ── Logo ── */}
          <motion.div 
            whileHover={{ scale: 1.04, rotate: -1 }}
            whileTap={{ scale: 0.96 }}
            className="flex-shrink-0"
          >
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all duration-300 border border-earth-200/50 dark:border-earth-700/50">
                <img src="/trace_logo.jpg" alt="Trace Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-earth-900 dark:text-earth-50 tracking-tight leading-none group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  Trace
                </span>
                <span className="text-[10px] font-bold text-earth-500 dark:text-earth-400 tracking-widest uppercase mt-0.5">
                  Lost & Found
                </span>
              </div>
            </Link>
          </motion.div>

          {/* ── Desktop Navigation Pills ── */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: {}
            }}
            className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-earth-100/50 dark:bg-earth-900/40 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] border border-earth-200/60 dark:border-earth-700/50"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <motion.div
                  key={link.path}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.path}
                    className="relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 z-10 group select-none"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white dark:bg-earth-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-earth-200/50 dark:border-earth-700/50 rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-earth-500 dark:text-earth-400 group-hover:text-earth-900 dark:group-hover:text-earth-100'}`} />
                    <span className={`transition-colors duration-300 ${isActive ? 'text-earth-900 dark:text-earth-100' : 'text-earth-600 dark:text-earth-300 group-hover:text-earth-900 dark:group-hover:text-earth-100'}`}>
                      {link.name}
                    </span>
                    {link.path === '/report' && !isActive && (
                      <Sparkles className="w-3 h-3 text-gold-500 animate-pulse" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Desktop Right Controls ── */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
              hidden: {}
            }}
            className="hidden md:flex items-center gap-4"
          >
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}>
              <NotificationBell />
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={cycleTheme}
              className="flex items-center justify-center w-11 h-11 rounded-2xl border border-earth-200/60 dark:border-earth-700/50 bg-earth-100/50 dark:bg-earth-900/40 hover:bg-white dark:hover:bg-earth-800 transition-all duration-300 text-earth-600 dark:text-earth-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-2xl backdrop-saturate-150 group"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 group-hover:text-gold-500 transition-colors" />
                  ) : theme === 'dark' ? (
                    <Moon className="w-5 h-5 group-hover:text-gold-400 transition-colors" />
                  ) : (
                    <Monitor className="w-5 h-5 group-hover:text-earth-900 dark:group-hover:text-earth-100 transition-colors" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 py-1.5 pl-1.5 pr-4 rounded-2xl border border-earth-200/60 dark:border-earth-700/50 bg-earth-100/50 dark:bg-earth-900/40 hover:bg-white dark:hover:bg-earth-800 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-2xl backdrop-saturate-150 group"
              >
                <div className="w-9 h-9 rounded-xl bg-earth-200 dark:bg-earth-800 flex items-center justify-center overflow-hidden text-earth-700 dark:text-earth-300 font-bold text-sm shadow-inner group-hover:scale-105 transition-transform border border-earth-200/40 dark:border-earth-700/50">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-bold text-earth-900 dark:text-earth-100 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(12px)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(12px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute right-0 mt-4 w-72 bg-earth-50/90 dark:bg-earth-950/90 backdrop-blur-3xl backdrop-saturate-200 border border-earth-200/50 dark:border-earth-800/50 z-50 overflow-hidden p-2.5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                    >
                      {/* User Info Header */}
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-white/60 dark:bg-earth-900/30 border border-earth-200/40 dark:border-earth-800/50 rounded-2xl mb-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-lg shadow-md border border-gold-300/20">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-earth-900 dark:text-earth-50 truncate">{user?.name}</p>
                            <p className="text-xs text-earth-500 dark:text-earth-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                        {user?.role === 'ADMIN' && (
                          <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-earth-900 dark:bg-earth-100 text-white dark:text-earth-900 shadow-sm">
                            <Shield className="w-3.5 h-3.5" /> Admin Portal
                          </span>
                        )}
                      </motion.div>

                      {/* Navigation Items */}
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.15 }}
                        className="space-y-1"
                      >
                        {user?.role === 'ADMIN' && (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-earth-700 dark:text-earth-200 hover:bg-white/80 dark:hover:bg-earth-800/50 transition-colors select-none"
                            >
                              <Shield className="w-4 h-4 text-earth-900 dark:text-earth-100" />
                              Admin Portal
                            </Link>
                          </motion.div>
                        )}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            to="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-earth-700 dark:text-earth-200 hover:bg-white/80 dark:hover:bg-earth-800/50 transition-colors select-none"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gold-500" />
                            Dashboard
                          </Link>
                        </motion.div>
                      </motion.div>

                      <div className="divider my-2 opacity-50" />

                      {/* Sign Out */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Mobile Trigger ── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 md:hidden"
          >
            <NotificationBell />
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-earth-100/50 dark:bg-earth-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-earth-200/60 dark:border-earth-700/50 text-earth-800 dark:text-earth-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="md:hidden absolute w-full px-4 pt-4 pb-6"
          >
            <div className="bg-earth-50/95 dark:bg-earth-950/95 backdrop-blur-3xl backdrop-saturate-200 p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-earth-200/60 dark:border-earth-800/60 space-y-4">
              <motion.div 
                initial="closed"
                animate="open"
                variants={{
                  open: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }
                }}
                className="grid grid-cols-1 gap-2"
              >
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      variants={{
                        open: { opacity: 1, x: 0, scale: 1 },
                        closed: { opacity: 0, x: -20, scale: 0.95 }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 select-none ${
                          isActive
                            ? 'bg-white dark:bg-earth-800 text-gold-600 dark:text-gold-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-earth-200/60 dark:border-earth-700/50'
                            : 'text-earth-800 dark:text-earth-200 hover:bg-white/60 dark:hover:bg-earth-800/50'
                        }`}
                      >
                        <link.icon className={`w-5 h-5 ${isActive ? 'text-gold-500' : ''}`} />
                        {link.name}
                        {link.path === '/report' && !isActive && (
                          <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse ml-auto" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="divider opacity-50" />

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cycleTheme}
                  className="flex items-center gap-2 text-sm font-bold text-earth-800 dark:text-earth-200 bg-white/50 dark:bg-earth-900/50 border border-earth-200/60 dark:border-earth-700/50 px-5 py-3 rounded-2xl shadow-sm"
                >
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  {theme}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 px-5 py-3 rounded-2xl hover:bg-red-50/80 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
