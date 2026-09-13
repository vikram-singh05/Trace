import { useState, useEffect, useRef } from 'react';
import { Send, User, Flag } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi, type ChatMessage } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/socket';
import type { Socket } from 'socket.io-client';
import ReportModal from './ReportModal';
import ConfirmModal from '../ui/ConfirmModal';
import { Trash2 } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
  conversationId: string;
  otherPartyName: string;
  otherPartyId: string;
}

export default function ChatWindow({ conversationId, otherPartyName, otherPartyId }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () => chatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setIsDeleteModalOpen(false);
      navigate('/messages');
    },
  });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['chat', conversationId],
    queryFn: ({ pageParam }) => chatApi.getMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: false,
  });


  useEffect(() => {
    if (data) {
      const allMessages = [...data.pages].reverse().flatMap((p) => p.messages);
      setMessages(allMessages);
    }
  }, [data]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('join_chat', conversationId);

    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleReconnect = () => {
      socket.emit('join_chat', conversationId);
      refetch();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('connect', handleReconnect);
    };
  }, [conversationId, refetch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      conversationId,
      content: newMessage,
      receiverId: otherPartyId,
    });
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-earth-900/40 rounded-2xl overflow-hidden border border-earth-200 dark:border-earth-700/50 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gold-500 to-amber-600 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{otherPartyName}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Secure Chat</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Report User"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Delete Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Messages Area */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-earth-50/50 dark:bg-black/20" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-earth-500 dark:text-earth-400">
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs">Send a message to start chatting.</p>
          </div>
        ) : (
          <>
            {hasNextPage && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <span className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    'Load older messages'
                  )}
                </button>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                    ? 'bg-gold-500 text-white rounded-br-sm'
                    : 'bg-white dark:bg-earth-800 text-earth-900 dark:text-white border border-earth-200 dark:border-white/10 rounded-bl-sm'
                    }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-earth-400 dark:text-earth-500 mt-1 font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-earth-200 dark:border-earth-700/50 bg-white/60 dark:bg-earth-950/40 backdrop-blur-md flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-white/80 dark:bg-earth-900/80 border border-earth-200/50 dark:border-earth-700/50 focus:border-gold-500 rounded-xl outline-none text-sm font-medium text-earth-900 dark:text-white transition-all shadow-inner placeholder:text-earth-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="w-11 h-11 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:opacity-50 disabled:hover:from-gold-500 disabled:hover:to-gold-600 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-gold-500/20 active:scale-95"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportedId={otherPartyId}
        reportedName={otherPartyName}
        conversationId={conversationId}
      />

      {isDeleteModalOpen && (
        <ConfirmModal
          title="Delete Chat"
          message="This removes the conversation from your inbox. The other person keeps their copy, and the chat will reappear here if they send you a new message."
          danger={true}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Chat"}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
