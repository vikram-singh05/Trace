import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ShieldCheck,
  Bell,
  Camera,
  LayoutGrid,
  Users,
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle2,
  RefreshCcw,
  Search,
  MapPin,
  Radio,
  Cpu,
  Shield
} from 'lucide-react';

export default function Landing() {
  const [simulationState, setSimulationState] = useState<'idle' | 'scanning' | 'matched'>('idle');
  const { scrollYProgress } = useScroll();
  
  // Parallax values
  const yBg1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const yBg2 = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  
  const runSimulation = () => {
    setSimulationState('scanning');
    setTimeout(() => setSimulationState('matched'), 2500);
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Smart Matching',
      description: 'AI-powered item matching with confidence scoring automatically connects lost and found reports.',
      size: 'large' as const,
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Secure Verification',
      description: 'Secret verification questions ensure items are returned to their rightful owners.',
      size: 'medium' as const,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Real-time Alerts',
      description: 'Instant notifications when a match is found or a claim is submitted on your item.',
      size: 'medium' as const,
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: 'Photo Evidence',
      description: 'Upload multiple images to help identify items quickly and accurately.',
      size: 'small' as const,
    },
    {
      icon: <LayoutGrid className="w-5 h-5" />,
      title: 'Smart Categories',
      description: 'Organized by category for effortless browsing and searching.',
      size: 'small' as const,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Admin Moderation',
      description: 'Dedicated admin tools keep the platform safe and organized.',
      size: 'small' as const,
    },
  ];

  // Variants for staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const featureContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const featureItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="min-h-screen relative bg-black selection:bg-gold-500/30 overflow-hidden">
      <div className="premium-bg opacity-40" />

      {/* ═══════════════════════════════════════
          NEW HERO SECTION (Framer Motion)
         ═══════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex flex-col justify-center pt-24 pb-16">
        {/* Parallax Glow Effects */}
        <motion.div 
          style={{ y: yBg1 }}
          className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[130px] pointer-events-none" 
        />
        <motion.div 
          style={{ y: yBg2 }}
          className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" 
        />

        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Text Content */}
          <motion.div 
            className="flex-1 text-center lg:text-left mt-10 lg:mt-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-500/10 backdrop-blur-sm"
            >
              <motion.span 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-gold-500" 
              />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-500">
                Intelligence Network
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] text-white">
              Find what you<br />
              lost.<br />
              <span className="text-gold-500 relative inline-block">
                Instantly.
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
                  className="absolute bottom-2 left-0 h-2 bg-gold-500/30 -z-10 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-earth-400 text-lg sm:text-xl mt-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Trace is the centralized, AI-assisted lost and found network for your community. Report items in seconds and let our matching engine do the rest.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-5 mt-10">
              <Link to="/register" className="w-full sm:w-auto block">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gold-500 text-black font-extrabold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(234,179,8,0.2)]"
                >
                  Join the Network <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
              <Link to="/items" className="w-full sm:w-auto block">
                <motion.div
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white/5 border border-white/10 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Search className="w-5 h-5 opacity-70" /> Browse Database
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-8 mt-12">
              <div className="flex items-center gap-2 text-earth-300 font-bold text-sm">
                <Users className="w-4 h-4 opacity-50" /> 12k+ Users
              </div>
              <div className="flex items-center gap-2 text-earth-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 opacity-50" /> 4.8k+ Items Returned
              </div>
            </motion.div>
          </motion.div>

          {/* Right Interactive Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 40, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
            className="flex-1 w-full max-w-lg lg:max-w-xl perspective-1000"
          >
            <motion.div 
              whileHover={{ rotateY: -5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group"
            >
              {/* Animated Glow Behind Widget */}
              <motion.div 
                animate={{ 
                  backgroundColor: simulationState === 'scanning' ? 'rgba(99, 102, 241, 0.4)' 
                                 : simulationState === 'matched' ? 'rgba(234, 179, 8, 0.4)' 
                                 : 'rgba(255, 255, 255, 0.05)'
                }}
                className="absolute -inset-1 rounded-3xl blur-xl transition-all duration-1000" 
              />
              
              <div className="relative rounded-3xl bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a] bg-black/50 backdrop-blur-md z-20">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-earth-500 tracking-wider">
                    <Radio className="w-3.5 h-3.5" /> matcher.service
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-earth-400 uppercase tracking-widest">
                    <motion.span 
                      animate={{ 
                        backgroundColor: simulationState === 'scanning' ? '#6366f1' : simulationState === 'matched' ? '#eab308' : '#10b981',
                        scale: simulationState === 'scanning' ? [1, 1.5, 1] : 1
                      }}
                      transition={simulationState === 'scanning' ? { repeat: Infinity, duration: 1 } : {}}
                      className="w-1.5 h-1.5 rounded-full" 
                    />
                    Active
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 relative">
                  
                  {/* Radar Scanning Effect using Framer Motion */}
                  <AnimatePresence>
                    {simulationState === 'scanning' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              delay: i * 0.4,
                              ease: "easeOut" 
                            }}
                            className="absolute w-[200px] h-[200px] border border-indigo-500/60 rounded-full"
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Target Item */}
                  <div className="relative z-10 flex justify-between items-start mb-6 h-[72px]">
                    <div>
                      <span className="text-[10px] font-extrabold text-earth-500 tracking-widest uppercase mb-1 block">Lost Item</span>
                      <h3 className="text-xl font-bold text-white mb-0.5">Apple AirPods Pro</h3>
                      <p className="text-sm text-earth-400">Left bud missing</p>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {simulationState === 'matched' && (
                        <motion.div 
                          key="matched"
                          initial={{ opacity: 0, y: -20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", bounce: 0.6 }}
                          className="text-right"
                        >
                          <div className="text-3xl font-black text-gold-500 tracking-tight">98.4%</div>
                          <div className="text-[10px] font-extrabold text-earth-500 uppercase tracking-widest">Match Score</div>
                        </motion.div>
                      )}
                      {simulationState === 'scanning' && (
                        <motion.div 
                          key="scanning"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-right"
                        >
                          <motion.div 
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-3xl font-black text-indigo-400 tracking-tight font-mono"
                          >
                            --.-%
                          </motion.div>
                          <div className="text-[10px] font-extrabold text-earth-500 uppercase tracking-widest">Analyzing</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Match Card */}
                  <motion.div 
                    layout
                    animate={{
                      backgroundColor: simulationState === 'matched' ? '#12110c' : '#111111',
                      borderColor: simulationState === 'matched' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255,255,255,0.05)',
                      boxShadow: simulationState === 'matched' ? '0 0 30px rgba(234,179,8,0.1)' : 'none',
                      filter: simulationState === 'idle' ? 'grayscale(100%) opacity(40%)' : simulationState === 'scanning' ? 'grayscale(50%) opacity(70%)' : 'grayscale(0%) opacity(100%)'
                    }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 rounded-2xl border"
                  >
                    <div className="p-4 flex gap-4">
                      <motion.div 
                        animate={{
                          backgroundColor: simulationState === 'matched' ? '#eab308' : '#292524'
                        }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      >
                        <MapPin className={`w-6 h-6 ${simulationState === 'matched' ? 'text-black' : 'text-earth-500'}`} />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-white text-sm">Found: White Earbuds</h4>
                          <AnimatePresence>
                            {simulationState === 'matched' && (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[9px] font-bold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/20"
                              >
                                New
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="text-xs text-earth-400 mb-3">Found in Science Library, 3rd Floor</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <motion.div 
                            animate={{
                              backgroundColor: simulationState === 'matched' ? '#1a1705' : 'rgba(0,0,0,0.5)',
                              borderColor: simulationState === 'matched' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                              color: simulationState === 'matched' ? '#eab308' : '#57534E'
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1"
                          >
                            {simulationState === 'matched' && <CheckCircle2 className="w-3 h-3" />} Location Match
                          </motion.div>
                          <motion.div 
                            animate={{
                              backgroundColor: simulationState === 'matched' ? '#1a1705' : 'rgba(0,0,0,0.5)',
                              borderColor: simulationState === 'matched' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                              color: simulationState === 'matched' ? '#eab308' : '#57534E'
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1"
                          >
                            {simulationState === 'matched' && <CheckCircle2 className="w-3 h-3" />} Time Match
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button 
                    whileHover={simulationState !== 'scanning' ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
                    whileTap={simulationState !== 'scanning' ? { scale: 0.98 } : {}}
                    onClick={runSimulation}
                    disabled={simulationState === 'scanning'}
                    className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {simulationState === 'scanning' && (
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent skew-x-12"
                      />
                    )}
                    <RefreshCcw className={`w-3.5 h-3.5 ${simulationState === 'scanning' ? 'animate-spin' : ''}`} /> 
                    {simulationState === 'scanning' ? 'Scanning Database...' : simulationState === 'matched' ? 'Restart Simulation' : 'Run Simulation'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>

        {/* Powered By Bottom Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-6 left-0 w-full text-center"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-earth-600 mb-3">Powered By</p>
          <div className="flex justify-center items-center gap-6 sm:gap-10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <motion.div whileHover={{ scale: 1.1, color: "#61dafb" }} className="flex items-center gap-1.5 font-bold text-white text-sm cursor-default"><Cpu className="w-5 h-5"/> React</motion.div>
            <motion.div whileHover={{ scale: 1.1, color: "#646cff" }} className="flex items-center gap-1.5 font-bold text-white text-sm cursor-default"><Zap className="w-5 h-5"/> Vite</motion.div>
            <motion.div whileHover={{ scale: 1.1, color: "#38bdf8" }} className="flex items-center gap-1.5 font-bold text-white text-sm cursor-default"><LayoutGrid className="w-5 h-5"/> Tailwind</motion.div>
            <motion.div whileHover={{ scale: 1.1, color: "#3ecf8e" }} className="flex items-center gap-1.5 font-bold text-white text-sm cursor-default"><Shield className="w-5 h-5"/> ImageKit</motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES SECTION
         ═══════════════════════════════════════ */}
      <section className="section-padding relative bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-lg mb-16"
          >
            <motion.span variants={itemVariants} className="w-12 h-1 bg-gold-500 rounded-full block mb-6" />
            <motion.h2 variants={itemVariants} className="text-4xl font-black text-white tracking-tight">
              Built for the modern world
            </motion.h2>
            <motion.p variants={itemVariants} className="text-earth-400 text-lg mt-4 font-medium">
              Every feature is designed with security, speed, and simplicity in mind
              — so you can focus on what matters.
            </motion.p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            variants={featureContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={featureItemVariants}
                whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.15)" }}
                className={`${feature.size === 'large'
                  ? 'md:col-span-2 lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl p-8 sm:p-10'
                  : feature.size === 'medium'
                    ? 'bg-[#111] border border-white/5 rounded-3xl p-7'
                    : 'bg-[#111] border border-white/5 rounded-3xl p-6'
                  }`}
              >
                <div
                  className={`flex items-center justify-center rounded-2xl mb-5 ${feature.size === 'large'
                    ? 'w-14 h-14 bg-gold-500/10 text-gold-500'
                    : 'w-11 h-11 bg-white/5 text-earth-300'
                    }`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`font-bold text-white ${feature.size === 'large' ? 'text-2xl' : 'text-lg'
                    }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-earth-400 mt-2 font-medium ${feature.size === 'large' ? 'max-w-md' : 'text-sm'
                    }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
         ═══════════════════════════════════════ */}
      <section className="section-padding relative bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-[#0a0a0a] border border-white/5 p-10 sm:p-16 lg:p-20 relative overflow-hidden text-center rounded-[3rem]"
          >
            {/* Decorative gradients */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold-500/10 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-[100px]" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-gold-500" />
                <span className="text-xs font-extrabold tracking-widest uppercase text-gold-500">
                  Join Your Community
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white max-w-2xl mx-auto tracking-tight">
                Ready to make your community a better place?
              </h2>

              <p className="text-earth-400 text-lg mt-6 max-w-xl mx-auto font-medium">
                Join thousands of users already using Trace to help each
                other recover lost belongings.
              </p>

              <div className="flex justify-center mt-10">
                <Link to="/register" className="block">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gold-500 text-black font-extrabold px-10 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(234,179,8,0.2)]"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                {['Secure & Private', 'Community Verified', 'Always Free'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-bold text-earth-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-earth-700/50 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Trace
                </span>
              </div>
              <p className="text-sm text-earth-500 font-medium leading-relaxed max-w-sm">
                The secure, intelligent lost-and-found platform designed for communities. 
                Helping people reunite with what matters most.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-earth-600 mb-5">
                Platform
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Sign In', path: '/login' },
                  { name: 'Create Account', path: '/register' },
                ].map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm font-bold text-earth-400 hover:text-gold-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-earth-600 mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {['Terms of Service', 'Privacy Policy', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm font-bold text-earth-400 hover:text-gold-500 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-earth-600 font-bold uppercase tracking-wider">
              © {new Date().getFullYear()} Trace. Designed for communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
