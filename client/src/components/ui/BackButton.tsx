import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  fallbackTo?: string;
  className?: string;
}

export default function BackButton({ label = 'Back', fallbackTo = '/', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 text-sm font-medium text-earth-500 dark:text-earth-400 hover:text-earth-800 dark:hover:text-earth-200 transition-colors group ${className}`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-earth-100 dark:bg-earth-800/50 group-hover:bg-earth-200 dark:group-hover:bg-earth-700/50 transition-colors">
        <ChevronLeft className="w-4 h-4 text-earth-600 dark:text-earth-400 transition-transform group-hover:-translate-x-0.5" />
      </div>
      {label}
    </button>
  );
}
