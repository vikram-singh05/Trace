import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { X, MessageSquare, AlertTriangle } from 'lucide-react';
import { chatApi, type ChatMessage } from '../../api/chatApi';

interface AdminChatLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  reportDetails: {
    reportedUserName: string;
    reporterName: string;
    reason: string;
  };
}

export default function AdminChatLogModal({ isOpen, onClose, conversationId, reportDetails }: AdminChatLogModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminChatLog', conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
    enabled: isOpen && !!conversationId,
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-earth-900 rounded-2xl border border-earth-200 dark:border-earth-700/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-earth-200 dark:border-earth-700/50 flex items-center justify-between bg-earth-50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
              <MessageSquare className="w-5 h-5 text-gold-500" />
            </div>
            <div>
              <h3 className="font-bold text-earth-900 dark:text-white flex items-center gap-2">
                Chat Audit Log
              </h3>
              <p className="text-xs text-earth-500 font-medium">Read-only view for moderation purposes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-200 dark:hover:bg-earth-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-earth-500" />
          </button>
        </div>

        {/* Report Context Banner */}
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Reported Context
            </p>
            <p className="text-xs text-earth-700 dark:text-earth-300 mt-1">
              <span className="font-semibold">{reportDetails.reporterName}</span> reported <span className="font-semibold">{reportDetails.reportedUserName}</span> for:
              <span className="italic ml-1">"{reportDetails.reason}"</span>
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-earth-50/30 dark:bg-black/10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 text-sm">Failed to load conversation logs.</div>
          ) : !data?.messages || data.messages.length === 0 ? (
            <div className="text-center text-earth-500 text-sm">No messages found in this conversation.</div>
          ) : (
            data.messages.map((msg: ChatMessage) => {
              const isReportedUser = msg.sender.name === reportDetails.reportedUserName;

              return (
                <div key={msg.id} className="flex flex-col items-start w-full">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-bold ${isReportedUser ? 'text-red-500' : 'text-earth-700 dark:text-earth-300'}`}>
                      {msg.sender.name}
                      {isReportedUser && ' (Reported User)'}
                    </span>
                    <span className="text-[10px] text-earth-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] ${isReportedUser
                      ? 'bg-red-500/10 text-red-900 dark:text-red-100 border border-red-500/20 rounded-tl-sm'
                      : 'bg-white dark:bg-earth-800 text-earth-900 dark:text-white border border-earth-200 dark:border-earth-700/50 rounded-tl-sm shadow-sm'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
