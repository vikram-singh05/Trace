import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, User, Loader2, ChevronRight, Inbox } from 'lucide-react';
import { chatApi, type Conversation } from '../../api/chatApi';
import ChatWindow from '../../components/chat/ChatWindow';
import { useAuth } from '../../context/AuthContext';

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const activeConversationId = searchParams.get('conversationId');

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
  });

  // Default to first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      setSearchParams({ conversationId: conversations[0].id });
    }
  }, [conversations, activeConversationId, setSearchParams]);

  if (isLoading) {
    return (
      <div className="relative p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load conversations.
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="relative p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gold-500" />
        </div>
        <h2 className="heading-2 mb-2">No Active Chats</h2>
        <p className="body-text text-center max-w-sm">
          You don't have any active conversations yet. Secure chats are automatically created when ownership claims are approved.
        </p>
      </div>
    );
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const getOtherParty = (conv: Conversation) => {
    if (!user) return { name: 'Unknown', id: '', avatarUrl: null };
    
    // If the current user is the reporter, the other party is the claimant
    if (user.id === conv.claim.item.reporterId) {
      return { 
        name: conv.claim.claimant.name, 
        id: conv.claim.claimant.id, 
        avatarUrl: conv.claim.claimant.avatarUrl 
      };
    }
    
    // If the current user is the claimant, the other party is the item reporter
    return { 
      name: conv.claim.item.reporter.name, 
      id: conv.claim.item.reporterId, 
      avatarUrl: conv.claim.item.reporter.avatarUrl 
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
      <div className="flex h-full gap-6 animate-fade-up">
        
        {/* Sidebar List */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-earth-900/40 rounded-2xl border border-earth-200 dark:border-earth-700/50 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-earth-200 dark:border-earth-700/50 bg-earth-50/50 dark:bg-black/20">
            <h2 className="heading-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-500" />
              Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.map((conv) => {
              const otherParty = getOtherParty(conv);
              const isActive = conv.id === activeConversationId;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setSearchParams({ conversationId: conv.id })}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${
                    isActive 
                      ? 'bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800/50 shadow-sm' 
                      : 'hover:bg-earth-50 dark:hover:bg-earth-800/40 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-gold-100 dark:bg-gold-900/50 text-gold-600' : 'bg-earth-100 dark:bg-earth-800 text-earth-500'
                  }`}>
                    {otherParty.avatarUrl ? (
                      <img src={otherParty.avatarUrl} alt={otherParty.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-gold-700 dark:text-gold-400' : 'text-earth-900 dark:text-earth-100'}`}>
                      {otherParty.name}
                    </h4>
                    <p className="text-xs text-earth-500 truncate mt-0.5">
                      Re: {conv.claim.item.title}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    isActive ? 'text-gold-500 translate-x-1' : 'text-earth-300 dark:text-earth-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="hidden md:flex flex-1 flex-col relative h-full">
          {activeConversation ? (
            <ChatWindow 
              conversationId={activeConversation.id}
              otherPartyName={getOtherParty(activeConversation).name}
              otherPartyId={getOtherParty(activeConversation).id}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-earth-900/40 rounded-2xl border border-earth-200 dark:border-earth-700/50">
              <MessageSquare className="w-12 h-12 text-earth-300 dark:text-earth-700 mb-4" />
              <h3 className="text-lg font-bold text-earth-600 dark:text-earth-400">Select a conversation</h3>
              <p className="text-sm text-earth-500 mt-1">Choose a chat from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
