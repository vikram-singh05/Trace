import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, ShieldAlert, Loader2 } from 'lucide-react';
import { reportApi, type CreateReportInput } from '../../api/reportApi';
import CustomDropdown from '../ui/CustomDropdown';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedId: string;
  reportedName: string;
  conversationId: string;
}

export default function ReportModal({ isOpen, onClose, reportedId, reportedName, conversationId }: ReportModalProps) {
  const [type, setType] = useState<CreateReportInput['type']>('INAPPROPRIATE_BEHAVIOR');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reportMutation = useMutation({
    mutationFn: (data: CreateReportInput) => reportApi.createReport(data),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to submit report');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!reason.trim()) {
      setError('Please provide a reason for the report.');
      return;
    }

    reportMutation.mutate({
      type,
      reason,
      reportedId,
      conversationId,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-earth-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-4 border-b border-earth-200 dark:border-earth-800 flex justify-between items-center bg-danger-light/50 dark:bg-danger-dark/20">
          <h2 className="font-bold text-danger flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Report {reportedName}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg transition-colors">
            <X className="w-5 h-5 dark:text-earth-300" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 mb-2">Report Submitted</h3>
              <p className="text-sm text-earth-600 dark:text-earth-400">
                Thank you for keeping Trace safe. Our moderation team will review this report shortly.
              </p>
              <button onClick={onClose} className="mt-6 w-full btn-primary py-2.5">Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-xl">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">
                  Reason for reporting
                </label>
                <CustomDropdown
                  value={type}
                  onChange={(value) => setType(value as any)}
                  options={[
                    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
                    { value: 'FALSE_CLAIM', label: 'False Claim / Scam' },
                    { value: 'HARASSMENT', label: 'Harassment / Abuse' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">
                  Additional Details
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide specific details about what happened..."
                  className="w-full px-4 py-3 bg-earth-50 dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none min-h-[100px] text-sm dark:text-earth-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-earth-100 dark:border-earth-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-earth-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportMutation.isPending}
                  className="px-6 py-2 bg-danger hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
