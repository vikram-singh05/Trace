import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-earth-200/50 dark:border-earth-800/50 bg-earth-50/70 dark:bg-earth-950/70 backdrop-blur-3xl overflow-hidden mt-auto">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold-500/10 dark:bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-gold-500/25 border border-white/20 dark:border-white/10"
              >
                <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </motion.div>
              <span className="text-2xl font-bold tracking-tight text-earth-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                Trace
              </span>
            </Link>
            <p className="text-sm font-medium text-earth-600 dark:text-earth-400 leading-relaxed max-w-sm mb-6">
              The advanced lost and found network for universities. Secure, verifiable, and instantaneous. Reconnect with what matters.
            </p>

          </motion.div>

          {/* Links Columns */}
          <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-2 lg:col-start-6">
            <h3 className="text-xs font-black text-earth-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500/50" /> Product
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Browse Items', path: '/items' },
                { name: 'Report Lost Item', path: '/report' },
                { name: 'Report Found Item', path: '/report?type=found' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="group flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors font-medium">
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-2">
            <h3 className="text-xs font-black text-earth-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-earth-500/50" /> Legal
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Security Overview', path: '/security' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="group flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors font-medium">
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Column */}
          <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-3">
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-earth-900/40 border border-earth-200/50 dark:border-white/5 shadow-xl shadow-earth-500/5 dark:shadow-black/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-earth-900 dark:text-white mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-500" /> Stay Updated
                </h3>
                <p className="text-xs text-earth-600 dark:text-earth-400 mb-4 leading-relaxed">
                  Join our newsletter for updates on new networks and features.
                </p>
                <form className="relative" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-earth-100/50 dark:bg-earth-950/50 border border-transparent focus:border-gold-500/50 focus:bg-white dark:focus:bg-earth-900 text-sm outline-none transition-all placeholder:text-earth-500/50"
                  />
                  <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-gold-500 hover:bg-gold-600 flex items-center justify-center text-white transition-colors shadow-md shadow-gold-500/20 active:scale-95">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-16 pt-8 border-t border-earth-200/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-2 text-earth-500 dark:text-earth-400 text-xs font-semibold">
            <span>&copy; {currentYear} Trace.</span>
            <span className="hidden sm:inline">Crafted with precision.</span>
          </div>
          <div className="flex gap-3">
            {['Twitter', 'GitHub', 'LinkedIn'].map((social, i) => (
              <motion.a 
                key={i}
                href="#" 
                whileHover={{ y: -3, scale: 1.05 }}
                className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-earth-200/50 dark:border-white/10 text-earth-600 dark:text-earth-400 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-500/30 transition-all text-xs font-bold tracking-wide shadow-sm"
              >
                {social}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
