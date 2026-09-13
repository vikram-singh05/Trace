import React, { useState, useRef } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  status?: 'idle' | 'success' | 'error';
  disabled?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  status = 'idle',
  disabled = false
}: OtpInputProps) {
  const [, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpArray = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focusInput = (index: number) => {
    const safeIndex = Math.max(0, Math.min(length - 1, index));
    setActiveInput(safeIndex);
    inputRefs.current[safeIndex]?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9]*$/.test(val)) return;

    const newOtp = [...otpArray];

    newOtp[index] = val.substring(val.length - 1);

    const joined = newOtp.join('');
    onChange(joined);

    if (val && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otpArray];

      if (newOtp[index]) {
        newOtp[index] = '';
        onChange(newOtp.join(''));
      } else if (index > 0) {
        newOtp[index - 1] = '';
        onChange(newOtp.join(''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);
    focusInput(Math.min(pastedData.length, length - 1));
  };

  let wrapperClass = "flex justify-center gap-1.5 sm:gap-2 lg:gap-3";
  if (status === 'error') wrapperClass += " animate-shake";

  return (
    <div className={wrapperClass}>
      {otpArray.map((digit, index) => {
        let inputClass = "w-10 h-12 sm:w-12 sm:h-14 lg:w-14 lg:h-16 text-center text-xl sm:text-2xl font-semibold bg-earth-50 dark:bg-earth-800/60 border border-earth-200 dark:border-earth-700 text-earth-900 dark:text-earth-100 rounded-xl outline-none otp-input transition-all duration-300";

        if (status === 'success') {
          inputClass += " border-green-500 bg-green-50/50 dark:bg-green-950/30 text-green-600 dark:text-green-400 ring-2 ring-green-500/20";
        } else if (status === 'error') {
          inputClass += " animate-shake border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 ring-2 ring-red-500/20";
        } else {
          inputClass += " focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20";
          if (digit) inputClass += " border-earth-400 dark:border-earth-500";
        }

        return (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveInput(index)}
            disabled={disabled || status === 'success'}
            className={inputClass}
            autoComplete="one-time-code"
          />
        );
      })}
    </div>
  );
}
