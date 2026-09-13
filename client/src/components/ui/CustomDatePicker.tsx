import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  id?: string;
  className?: string;
  placeholderText?: string;
  showTimeSelect?: boolean;
}

const CustomInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, placeholder, className, id }, ref) => (
  <button
    type="button"
    className={`w-full flex items-center justify-between text-left ${className}`}
    onClick={onClick}
    ref={ref}
    id={id}
  >
    <span className={value ? 'text-earth-900 dark:text-earth-100 font-medium' : 'text-earth-400'}>
      {value || placeholder}
    </span>
    <CalendarIcon className="w-5 h-5 text-earth-400" />
  </button>
));

CustomInput.displayName = 'CustomInput';

export default function CustomDatePicker({
  selected,
  onChange,
  id,
  className = '',
  placeholderText = 'Select date & time',
  showTimeSelect = true
}: CustomDatePickerProps) {

  return (
    <div className="relative custom-datepicker-wrapper">
      <DatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText={placeholderText}
        popperPlacement="top-start"
        customInput={<CustomInput className={className} />}
        wrapperClassName="w-full"
        calendarClassName="!bg-white dark:!bg-earth-900 !border-earth-200 dark:!border-earth-800 !shadow-2xl !font-sans !rounded-xl overflow-hidden"
        dayClassName={() =>
          "!text-earth-700 dark:!text-earth-300 hover:!bg-earth-100 dark:hover:!bg-earth-800 !rounded-lg transition-colors"
        }
      />

      <style>{`
        /* Overriding react-datepicker defaults to match Trace theme */
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid var(--color-earth-200) !important;
        }
        .dark .react-datepicker__header {
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
          color: var(--color-earth-900) !important;
          font-weight: 700 !important;
        }
        .dark .react-datepicker__current-month, .dark .react-datepicker-time__header, .dark .react-datepicker-year-header {
          color: var(--color-earth-100) !important;
        }
        .react-datepicker__day-name {
          color: var(--color-earth-500) !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
          background-color: var(--color-gold-500) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          font-weight: bold !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid var(--color-earth-200) !important;
        }
        .dark .react-datepicker__time-container {
          border-left: 1px solid rgba(255,255,255,0.1) !important;
        }
        .react-datepicker__time-list-item {
          color: var(--color-earth-700) !important;
          transition: background-color 0.2s;
        }
        .dark .react-datepicker__time-list-item {
          color: var(--color-earth-300) !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: var(--color-earth-100) !important;
        }
        .dark .react-datepicker__time-list-item:hover {
          background-color: var(--color-earth-800) !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: var(--color-gold-500) !important;
          color: white !important;
          font-weight: bold !important;
        }
        .react-datepicker__triangle {
          display: none !important;
        }
        .react-datepicker__time-container .react-datepicker__time {
          background-color: transparent !important;
        }
        .dark .react-datepicker__time-container .react-datepicker__time,
        .dark .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          background-color: var(--color-earth-900) !important;
        }
      `}</style>
    </div>
  );
}
