import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import OtpInput from '../../components/ui/OtpInput';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

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

const formStepVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
  exit: { 
    opacity: 0, 
    x: -20, 
    transition: { duration: 0.2 } 
  }
};

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register({ name, email, password, confirmPassword });
      setStep(2);
    } catch (err: any) {
      setError(err?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.error?.message || 'Invalid verification code');
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
              Trace every lost item.
            </h1>
            <p className="text-earth-300 text-lg font-medium leading-relaxed">
              Create an account with your email to join the secure intelligence network.
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
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 h-1.5 rounded-full bg-white/50 dark:bg-earth-800/50 overflow-hidden relative backdrop-blur-sm">
                <motion.div 
                  initial={false}
                  animate={{ width: step === 1 ? '50%' : '100%' }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-500 to-amber-600 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                />
              </div>
              <span className="text-[10px] font-bold text-earth-500 ml-4 uppercase tracking-widest whitespace-nowrap">
                Step {step} of 2
              </span>
            </div>

            <motion.h2 
              key={`h2-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-earth-900 dark:text-white mb-2"
            >
              {step === 1 ? 'Create an Account' : 'Verify your email'}
            </motion.h2>
            <motion.p 
              key={`p-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-earth-600 dark:text-earth-400 text-sm mb-8 font-medium"
            >
              {step === 1 
                ? 'Please fill in the information below to get started.' 
                : 'We\'ve sent a 6-digit code to your email.'}
            </motion.p>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3"
                >
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative w-full">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form 
                    key="step-1"
                    variants={formStepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-5 w-full" 
                    onSubmit={handleRegister}
                  >
                    <div>
                      <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field py-4 text-base bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 focus:ring-gold-500/20 transition-all rounded-2xl shadow-sm text-earth-900 dark:text-white placeholder-earth-400 dark:placeholder-earth-500"
                        placeholder="e.g. Alex Chen"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field py-4 text-base bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 focus:ring-gold-500/20 transition-all rounded-2xl shadow-sm text-earth-900 dark:text-white placeholder-earth-400 dark:placeholder-earth-500"
                        placeholder="alex@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
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
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-field py-4 pr-12 text-base bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 focus:ring-gold-500/20 transition-all rounded-2xl shadow-sm text-earth-900 dark:text-white placeholder-earth-400 dark:placeholder-earth-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-gold-500 transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 group mt-6 hover:shadow-gold-500/30 transition-all border border-white/10"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="step-2"
                    variants={formStepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6 w-full" 
                    onSubmit={handleVerifyOtp}
                  >
                    <div className="bg-white/50 dark:bg-earth-950/40 p-4 rounded-2xl border border-earth-200/50 dark:border-white/10 mb-6 flex items-start gap-3 shadow-inner backdrop-blur-md">
                      <ShieldCheck className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-earth-700 dark:text-earth-300 leading-relaxed">
                        Please check your inbox at <span className="font-bold text-earth-900 dark:text-white">{email}</span>.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-3 text-center sm:text-left">
                        Verification Code
                      </label>
                      <div className="flex justify-center sm:justify-start">
                        <OtpInput length={6} value={otp} onChange={setOtp} />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="w-full py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 group mt-6 hover:shadow-gold-500/30 transition-all border border-white/10 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Email
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                    
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm font-bold text-earth-500 hover:text-gold-500 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {step === 1 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 text-center text-sm text-earth-600 dark:text-earth-400 font-medium"
                >
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors ml-1">
                    Sign in
                  </Link>
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
