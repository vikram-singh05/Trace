import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const formVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.error?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-earth-50 dark:bg-earth-950 overflow-hidden">
      
      {/* ── Premium Liquid Glass Background ── */}
      <div className="premium-bg" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-earth-900/40 backdrop-blur-3xl backdrop-saturate-150">
        
        {/* ── Left Side: Branding ── */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-end p-12 overflow-hidden border-r border-white/20 dark:border-white/5">
          {/* Ambient Background Image */}
          <div className="absolute inset-0 bg-earth-950">
            <img 
              src="/trace_logo.jpg" 
              className="w-full h-full object-cover scale-110 origin-center opacity-40 blur-[2px] transition-transform duration-[15000ms] hover:scale-125" 
              alt="Trace Ambient Background"
            />
          </div>
          {/* Multi-layered gradient for depth and perfect readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-950/80 via-transparent to-transparent" />
          
          <div className="relative z-10 space-y-6 text-left p-10 rounded-[2rem] bg-white/5 dark:bg-earth-900/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl">
            <Link to="/" className="inline-flex items-center gap-4 group mb-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <span className="text-4xl font-black text-white tracking-tight leading-none">
                Trace
              </span>
            </Link>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Welcome back.
            </h1>
            <p className="text-earth-300 text-lg font-medium leading-relaxed">
              Sign in to manage your found items and continue helping the community thrive.
            </p>
          </div>
        </div>

        {/* ── Right Side: Form ── */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-gold-500/20 border border-earth-200/50 dark:border-earth-700/50">
              <img src="/trace_logo.jpg" alt="Trace Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="text-3xl font-bold text-earth-900 dark:text-white tracking-tight leading-none">
              Trace
            </span>
          </div>

          <motion.div 
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-earth-900 dark:text-white mb-2">
              Sign in
            </motion.h2>
            <motion.p variants={itemVariants} className="text-earth-600 dark:text-earth-400 text-sm mb-8 font-medium">
              Please enter your details to access your account.
            </motion.p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3"
              >
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field py-4 text-base bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 focus:ring-gold-500/20 transition-all rounded-2xl shadow-sm text-earth-900 dark:text-white placeholder-earth-400 dark:placeholder-earth-500"
                  placeholder="you@example.com"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field py-4 pr-12 text-base bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 focus:ring-gold-500/20 transition-all rounded-2xl shadow-sm text-earth-900 dark:text-white placeholder-earth-400 dark:placeholder-earth-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-gold-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-end">
                <a href="#" className="text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors">
                  Forgot password?
                </a>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 group mt-6 hover:shadow-gold-500/30 transition-all border border-white/10"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
            
            <motion.p variants={itemVariants} className="mt-8 text-center text-sm text-earth-600 dark:text-earth-400 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors ml-1">
                Sign up
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
