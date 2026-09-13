import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({ options, value, onChange, placeholder = 'Select an option', className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field w-full flex items-center justify-between bg-white/80 dark:bg-white/[0.04] text-sm"
      >
        <span className={`flex items-center gap-2 ${!selectedOption ? 'text-earth-400 font-medium' : 'text-earth-900 dark:text-white font-bold'}`}>
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-earth-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-1.5 bg-white/95 dark:bg-[#12151F]/95 backdrop-blur-2xl border border-earth-200/90 dark:border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-auto animate-scale-in origin-top">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-earth-100/70 dark:hover:bg-white/[0.06] transition-colors ${
                value === option.value ? 'bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold' : 'text-earth-700 dark:text-earth-200 font-medium text-xs sm:text-sm'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
              </div>
              {value === option.value && <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
