import { useState, useEffect } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { claimApi } from '../../api/claimApi';
import type { ClaimAnswerInput } from '../../api/claimApi';
import { useModalAnimation } from '../../hooks/useModalAnimation';

interface ClaimModalProps {
  itemId: string;
  itemType?: 'LOST' | 'FOUND';
  questions: { id: string; question: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimModal({ itemId, itemType = 'FOUND', questions, onClose, onSuccess }: ClaimModalProps) {
  const { handleClose, overlayClass, panelClass } = useModalAnimation({
    onClose,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [answers, setAnswers] = useState<ClaimAnswerInput[]>(
    questions.map(q => ({ questionId: q.id, answer: '' }))
  );
  const [proofText, setProofText] = useState('');
  const [error, setError] = useState('');

  const claimMutation = useMutation({
    mutationFn: () => claimApi.createClaim({
      itemId,
      answers,
      proofText: proofText || undefined,
    }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      setError(err?.error?.message || 'Failed to submit claim.');
    }
  });

  const updateAnswer = (questionId: string, text: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, answer: text } : a));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length > 0 && answers.some(a => !a.answer.trim())) {
      setError('Please answer all verification questions.');
      return;
    }
    if (itemType === 'LOST' && !proofText.trim()) {
      setError('Please provide details about what you found.');
      return;
    }
    claimMutation.mutate();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${overlayClass}`}
      onClick={handleClose}
    >
      <div
        className={`card-feature w-full max-w-lg overflow-hidden shadow-2xl relative ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-earth-200 dark:border-earth-700/50 flex justify-between items-center">
          <h2 className="heading-3">{itemType === 'LOST' ? 'I Found This Item' : 'Claim This Item'}</h2>
          <button
            onClick={handleClose}
            className="text-earth-400 hover:text-earth-700 dark:hover:text-earth-200 transition-colors p-2 bg-earth-100 dark:bg-earth-800/50 rounded-xl hover:bg-earth-200 dark:hover:bg-earth-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-danger-light dark:bg-danger-dark/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium flex items-start gap-3 animate-shake">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {questions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-earth-600 dark:text-earth-400 mb-2 font-medium">Answer the verification questions:</p>
              {questions.map((q, idx) => (
                <div key={q.id} className="card-compact p-4">
                  <p className="text-sm font-semibold text-earth-800 dark:text-earth-200 mb-2">Q{idx + 1}: {q.question}</p>
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={answers.find(a => a.questionId === q.id)?.answer || ''}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-earth-700 dark:text-earth-300 mb-2">
              {itemType === 'LOST' ? (
                <>Details of the Found Item <span className="text-red-500">*</span></>
              ) : (
                <>Additional Proof <span className="text-earth-400 font-normal">(Optional)</span></>
              )}
            </label>
            <textarea
              placeholder={itemType === 'LOST'
                ? "Describe where you found it, what it looks like, and how the owner can get it back from you."
                : "Any other details that prove ownership? (e.g. 'There is a scratch on the back left corner')"}
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              rows={3}
              className="input-field resize-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={claimMutation.isPending}
            className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {claimMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
