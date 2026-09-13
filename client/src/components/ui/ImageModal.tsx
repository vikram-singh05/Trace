import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, alt = 'Preview', onClose }: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-earth-950/80 backdrop-saturate-150"
          onClick={handleClose}
        >
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 text-earth-100 hover:text-white bg-earth-900/40 hover:bg-earth-800/60 rounded-full transition-colors backdrop-blur-md border border-earth-700/50 hover:border-earth-500 z-10 shadow-lg shadow-black/20"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-earth-700/50 bg-earth-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={imageUrl} 
              alt={alt} 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
