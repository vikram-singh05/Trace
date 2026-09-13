import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}: ConfirmModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const modalContent = (
    <AnimatePresence onExitComplete={onCancel}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-900/40 dark:bg-earth-950/60 backdrop-saturate-150"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative bg-white/90 dark:bg-earth-900/90 backdrop-blur-3xl backdrop-saturate-200 border border-earth-200/50 dark:border-earth-700/50 rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-earth-200/50 dark:border-earth-800/50 flex justify-between items-center bg-white/50 dark:bg-earth-950/30">
              <h2 className="heading-3 flex items-center gap-3 text-earth-900 dark:text-earth-50">
                {danger ? (
                  <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center border border-gold-200 dark:border-gold-800/50">
                    <AlertCircle className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                )}
                {title}
              </h2>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="text-earth-500 hover:text-earth-900 dark:text-earth-400 dark:hover:text-earth-100 transition-colors p-2.5 bg-earth-100/50 dark:bg-earth-800/50 rounded-xl hover:bg-earth-200 dark:hover:bg-earth-700/50 border border-transparent hover:border-earth-300 dark:hover:border-earth-600"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="p-6 bg-white/30 dark:bg-earth-900/20">
              <p className="body-text text-earth-700 dark:text-earth-300 leading-relaxed">{message}</p>
            </div>
            <div className="p-6 pt-2 flex gap-3 bg-white/30 dark:bg-earth-900/20">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose} 
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-700/80 transition-colors shadow-sm"
              >
                {cancelText}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onConfirm();
                  handleClose();
                }}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center ${
                  danger 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_4px_16px_rgba(220,38,38,0.2)] hover:shadow-[0_6px_24px_rgba(220,38,38,0.3)] border border-red-600/50' 
                    : 'bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-[0_4px_16px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_24px_rgba(212,175,55,0.4)] border border-gold-600/50'
                }`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
