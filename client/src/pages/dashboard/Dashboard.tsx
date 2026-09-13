import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, FileText, ShieldCheck, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const menuItems = [
    {
      title: 'Publish a Listing',
      description: 'Lost or discovered an item? Create a high-priority listing with photo evidence.',
      icon: <PlusCircle className="w-6 h-6 text-gold-500" />,
      link: '/report',
      variant: 'feature' as const,
      tag: 'Primary Action',
      gradient: 'from-gold-500/20 via-gold-400/10 to-transparent',
    },
    {
      title: 'Search Database',
      description: 'Filter across all active listings by building, category, and date.',
      icon: <Search className="w-5 h-5 text-earth-600 dark:text-earth-300 group-hover:text-gold-500 transition-colors" />,
      link: '/items',
      variant: 'standard' as const,
      tag: 'Live Catalog',
      gradient: 'from-earth-500/15 to-transparent',
    },
    {
      title: 'My Reported Listings',
      description: 'Review match suggestions, edit descriptions, or resolve items.',
      icon: <FileText className="w-5 h-5 text-earth-600 dark:text-earth-300 group-hover:text-gold-500 transition-colors" />,
      link: '/my-reports',
      variant: 'standard' as const,
      tag: 'Owner Center',
      gradient: 'from-earth-500/15 to-transparent',
    },
    {
      title: 'My Claim Submissions',
      description: 'Track ongoing ownership verifications and finder reviews.',
      icon: <ShieldCheck className="w-5 h-5 text-earth-600 dark:text-earth-300 group-hover:text-gold-500 transition-colors" />,
      link: '/my-claims',
      variant: 'standard' as const,
      tag: 'Verification',
      gradient: 'from-earth-500/15 to-transparent',
    },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({
      title: 'Admin Portal',
      description: 'Manage users, enforce moderation, inspect reports, and view platform metrics.',
      icon: <Shield className="w-5 h-5 text-red-500" />,
      link: '/admin',
      variant: 'standard' as const,
      tag: 'Security',
      gradient: 'from-red-500/15 to-transparent',
    });
  }

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10 min-h-screen overflow-hidden bg-earth-50 dark:bg-earth-950 transition-colors duration-500">
      
      {/* ── Background Elements ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full filter blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-earth-500/10 rounded-full filter blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="max-w-5xl mx-auto relative z-10"
      >

        {/* ── User Welcome Header ── */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
          className="p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group bg-white/40 dark:bg-earth-900/40 backdrop-blur-3xl backdrop-saturate-200 border border-earth-200/60 dark:border-earth-800/50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-500/20 transition-colors duration-1000" />
          
          <div className="flex items-center gap-5 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-gold-500/25 flex-shrink-0 border border-gold-300/30"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || <Sparkles className="w-6 h-6" />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="caption-text text-gold-600 dark:text-gold-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Network Initialized
                </span>
              </div>
              <h1 className="heading-1 text-earth-900 dark:text-earth-50">
                {greeting()}, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-earth-500 dark:text-earth-400 font-medium mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {user?.role === 'ADMIN' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-earth-900 dark:bg-earth-100 text-white dark:text-earth-900 border border-earth-200/50 shadow-sm">
                <Shield className="w-3.5 h-3.5" /> Admin
              </span>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/report" className="btn-primary text-xs px-5 py-2.5 shadow-lg shadow-gold-500/20">
                + Publish Listing
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Action Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {menuItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className={item.variant === 'feature' ? 'md:col-span-2' : ''}
            >
              <Link
                to={item.link}
                className={`group relative overflow-hidden transition-all duration-500 flex flex-col justify-between block h-full bg-white/60 dark:bg-earth-900/30 backdrop-blur-2xl backdrop-saturate-150 border border-earth-200/60 dark:border-earth-800/50 rounded-3xl hover:border-gold-500/30 dark:hover:border-gold-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] ${item.variant === 'feature' ? 'p-8' : 'p-6 sm:p-7'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-earth-800 border border-earth-200/50 dark:border-earth-700/50 flex items-center justify-center shadow-sm transition-colors group-hover:border-gold-500/30"
                    >
                      {item.icon}
                    </motion.div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-white/80 dark:bg-earth-800 text-earth-600 dark:text-earth-300 border border-earth-200/50 dark:border-earth-700/50 shadow-sm">
                      {item.tag}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="pr-4">
                      <h3 className={`font-bold text-earth-900 dark:text-earth-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors ${
                        item.variant === 'feature' ? 'text-xl' : 'text-base'
                      }`}>
                        {item.title}
                      </h3>
                      <p className="body-text mt-1.5 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-xl bg-white/80 dark:bg-earth-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-white transition-all duration-300 border border-earth-200/50 dark:border-earth-700/50"
                    >
                      <ArrowRight className="w-4 h-4 text-earth-500 dark:text-earth-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
