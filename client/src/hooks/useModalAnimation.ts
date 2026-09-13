import { useState, useCallback, useEffect } from 'react';

interface UseModalAnimationOptions {
  isOpen?: boolean;
  onClose: () => void;
  duration?: number;
}


export function useModalAnimation({
  isOpen = true,
  onClose,
  duration = 240,
}: UseModalAnimationOptions) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, duration);
  }, [isClosing, onClose, duration]);


  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return {
    isClosing,
    handleClose,
    overlayClass: isClosing ? 'animate-modal-overlay-out' : 'animate-modal-overlay-in',
    panelClass: isClosing ? 'animate-modal-panel-out' : 'animate-modal-panel-in',
  };
}
