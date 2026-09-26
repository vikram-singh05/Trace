import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Search,
  Cpu,
  Shield,
  Activity,
  Globe,
  Users
} from 'lucide-react';

export default function Landing() {
  const { scrollYProgress } = useScroll();
  
  const yHeroText = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-earth-50 dark:bg-earth-950 transition-colors duration-500 font-sans">
      
      {/* ── Immersive Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Central glowing orb for Hero */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-400/30 via-gold-500/5 to-transparent dark:from-gold-500/20 dark:via-gold-700/5 dark:to-transparent blur-3xl opacity-70" />
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ═══════════════════════════════════════
          CENTERED HERO SECTION
         ═══════════════════════════════════════ */}
      <section className="relative z-10 pt-32 pb-10 flex flex-col items-center text-center px-6">
        <motion.div 
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full border border-earth-300 dark:border-earth-700 bg-white/50 dark:bg-earth-900/50 backdrop-blur-xl shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-earth-800 dark:text-earth-200">
              Trace Network v2.0
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] text-earth-900 dark:text-white mb-6"
          >
            Lost it? <br className="hidden md:block" />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-gradient-to-r from-gold-400/20 to-gold-600/20 blur-xl rounded-full" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-yellow-400 to-gold-600 dark:from-gold-300 dark:via-gold-400 dark:to-gold-600 drop-shadow-sm">
                We'll track it.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl text-earth-600 dark:text-earth-400 max-w-2xl font-medium leading-relaxed mb-10"
          >
            The centralized, AI-powered lost and found network for modern campuses. 
            Report items in seconds and let our semantic matching engine do the rest.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <button className="h-14 px-8 rounded-2xl font-bold text-white bg-earth-900 dark:bg-white dark:text-earth-900 hover:scale-105 transition-transform flex items-center justify-center gap-2 w-full shadow-xl shadow-earth-900/10 dark:shadow-white/10">
                Join the Network <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/items" className="w-full sm:w-auto">
              <button className="h-14 px-8 rounded-2xl font-bold text-earth-900 dark:text-white bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 hover:bg-earth-100 dark:hover:bg-earth-700 hover:scale-105 transition-all flex items-center justify-center gap-2 w-full">
                <Search className="w-5 h-5 opacity-70" /> Browse Database
              </button>
            </Link>
          </motion.div>

          {/* Trust / Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-earth-200/50 dark:border-earth-800/50 flex flex-wrap justify-center gap-8 md:gap-16 w-full"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-earth-900 dark:text-white">2k+</span>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-500">Items Found</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-earth-900 dark:text-white">98%</span>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-500">Return Rate</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-earth-900 dark:text-white">24/7</span>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-500">Moderation</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
         ═══════════════════════════════════════ */}
      <section className="py-24 relative z-10 bg-earth-50/50 dark:bg-earth-950/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-earth-900 dark:text-white tracking-tight mb-4">
              Three steps to recover.
            </h2>
            <p className="text-earth-500 dark:text-earth-400">
              A simple, secure process to get your valuables back.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-earth-200 via-earth-300 to-earth-200 dark:from-earth-800 dark:via-earth-700 dark:to-earth-800 z-0" />
            
            {[
              { icon: <Search className="w-6 h-6 text-blue-500" />, title: "1. Report", desc: "Log a detailed report of the lost or found item." },
              { icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />, title: "2. Verify", desc: "Use secret questions to securely verify ownership." },
              { icon: <Users className="w-6 h-6 text-gold-500" />, title: "3. Reconnect", desc: "Meet up safely and return the item to its owner." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-earth-900 border-4 border-earth-50 dark:border-earth-950 shadow-xl flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-earth-50 dark:bg-black/50 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-earth-600 dark:text-earth-400 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          BENTO GRID SECTION
         ═══════════════════════════════════════ */}
      <section className="py-24 relative bg-white dark:bg-[#0a0a0a] border-t border-earth-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-earth-900 dark:text-white tracking-tight mb-4">
              Everything you need to run a modern campus network.
            </h2>
            <p className="text-lg text-earth-500 dark:text-earth-400">
              A complete toolkit combining semantic search, secure verification, and administrative controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[250px]">
            
            {/* Bento 1: Large Database Feature */}
            <div className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-gradient-to-br from-earth-50 to-earth-100 dark:from-earth-900/50 dark:to-earth-900 p-8 flex flex-col relative overflow-hidden border border-earth-200 dark:border-earth-800 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px] group-hover:bg-blue-400/20 transition-colors duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-black/50 shadow-sm flex items-center justify-center mb-6 border border-earth-100 dark:border-earth-700">
                <Search className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-earth-900 dark:text-white mb-3">Unified Campus Database</h3>
              <p className="text-earth-600 dark:text-earth-400 text-lg max-w-md">
                A single, centralized platform for all lost and found items. Easily report, track, and manage items across the entire network in real-time.
              </p>
              
              <div className="mt-auto relative z-10 flex flex-col gap-3 overflow-hidden pt-8">
                 <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-4 rounded-xl border border-earth-200 dark:border-earth-700 shadow-xl w-[90%] flex items-center justify-between transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-sm text-earth-900 dark:text-white">Lost AirPods Pro</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-earth-400">2 mins ago</span>
                 </div>
                 
                 <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-xl w-[90%] self-end flex items-center justify-between transform translate-x-4 group-hover:translate-x-0 transition-transform duration-500 delay-75">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-semibold text-sm text-earth-900 dark:text-white">Found White Earbuds</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-500">Just Now</span>
                 </div>
              </div>
            </div>

            {/* Bento 2: Verification */}
            <div className="rounded-[2rem] bg-earth-50 dark:bg-earth-900/30 p-8 flex flex-col border border-earth-200 dark:border-earth-800 hover:border-earth-300 dark:hover:border-earth-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/50 shadow-sm flex items-center justify-center mb-4 border border-earth-100 dark:border-earth-700">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-2">Secret Verification</h3>
              <p className="text-earth-600 dark:text-earth-400 text-sm">
                Finders set secret questions that only the true owner can answer.
              </p>
              <div className="mt-auto bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-earth-200 dark:border-earth-800 text-xs text-earth-500 font-medium">
                Q: What is the lock screen wallpaper?
              </div>
            </div>

            {/* Bento 3: Admin */}
            <div className="rounded-[2rem] bg-earth-50 dark:bg-earth-900/30 p-8 flex flex-col border border-earth-200 dark:border-earth-800 hover:border-earth-300 dark:hover:border-earth-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/50 shadow-sm flex items-center justify-center mb-4 border border-earth-100 dark:border-earth-700">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-2">Admin Portal</h3>
              <p className="text-earth-600 dark:text-earth-400 text-sm">
                Dedicated dashboard to moderate items, ban users, and resolve support tickets.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE & CTA
         ═══════════════════════════════════════ */}
      <section className="py-24 relative bg-earth-900 dark:bg-black overflow-hidden">
        
        {/* Infinite Marquee */}
        <div className="absolute top-0 left-0 w-full h-16 bg-gold-500 flex items-center overflow-hidden border-b-4 border-gold-600">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex whitespace-nowrap text-earth-900 font-black uppercase tracking-widest text-lg items-center gap-10"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10">
                <span>Fast Resolution</span> <Zap className="w-5 h-5" />
                <span>Secure Platform</span> <Shield className="w-5 h-5" />
                <span>Community Driven</span> <Globe className="w-5 h-5" />
              </span>
            ))}
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center pt-20 relative z-10">
          <h2 className="text-5xl font-black text-white mb-6 tracking-tight">
            Ready to trace your items?
          </h2>
          <p className="text-earth-400 text-lg mb-10">
            Join the community today and experience the smartest way to recover lost belongings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <button className="h-14 px-10 rounded-full font-black text-earth-900 bg-white hover:bg-earth-100 transition-colors w-full sm:w-auto text-lg shadow-2xl shadow-white/10">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════ */}
      <footer className="border-t border-earth-200/10 bg-earth-950 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-earth-800 flex items-center justify-center bg-black">
                  <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-white text-xl">Trace Network</span>
              </div>
              <p className="text-earth-500 text-sm max-w-xs">
                The secure, intelligent lost-and-found platform designed for communities.
              </p>
            </div>
            
            <div className="flex gap-16">
              <div>
                <h4 className="text-white font-bold mb-4">Platform</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="text-earth-500 hover:text-white transition-colors text-sm">Sign In</Link>
                  <Link to="/register" className="text-earth-500 hover:text-white transition-colors text-sm">Create Account</Link>
                  <Link to="/items" className="text-earth-500 hover:text-white transition-colors text-sm">Database</Link>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <div className="flex flex-col gap-2">
                  <a href="#" className="text-earth-500 hover:text-white transition-colors text-sm">Terms</a>
                  <a href="#" className="text-earth-500 hover:text-white transition-colors text-sm">Privacy</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-earth-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-earth-500 font-medium">
              © {new Date().getFullYear()} Trace. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-earth-600">
               <Cpu className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
               <Globe className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
