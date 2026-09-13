import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, XCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { claimApi } from '../../api/claimApi';
import { chatApi } from '../../api/chatApi';

export default function MyClaims() {
  const navigate = useNavigate();
  const { data: claims, isLoading, isError } = useQuery({
    queryKey: ['myClaims'],
    queryFn: claimApi.getMyClaims,
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
  });

  const getConversationForClaim = (claimId: string) => {
    return conversations?.find(c => c.claimId === claimId);
  };

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10 min-h-screen">
      <div className="max-w-5xl mx-auto animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 flex items-center justify-center shadow-lg shadow-gold-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="gold-accent" />
              <span className="caption-text text-gold-600 dark:text-gold-400 font-bold">Ownership Claims</span>
            </div>
            <h1 className="heading-1">My Submitted Claims</h1>
            <p className="body-text mt-0.5 text-sm sm:text-base font-medium">Track and monitor finder approvals on items you have claimed.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-feature p-6 space-y-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 w-24 skeleton rounded-lg" />
                    <div className="h-5 w-40 skeleton rounded" />
                    <div className="h-3 w-28 skeleton rounded" />
                  </div>
                  <div className="w-14 h-14 skeleton rounded-xl" />
                </div>
                <div className="h-9 w-full skeleton rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-600 dark:text-red-400 font-bold animate-fade-up">
            Failed to load your claims. Please check your connection.
          </div>
        ) : !claims || claims.length === 0 ? (
          <div className="card-feature p-14 text-center animate-fade-up">
            <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/25 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float shadow-inner">
              <ShieldCheck className="w-10 h-10 text-gold-500" />
            </div>
            <h3 className="heading-3 mb-2">No Active Claims</h3>
            <p className="body-text mb-6 max-w-sm mx-auto">You haven't submitted any ownership verification claims yet.</p>
            <Link to="/items" className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-gold-500/25">
              Browse Found Listings
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {claims.map((claim, idx) => {
              const isApproved = claim.status === 'APPROVED';
              const isRejected = claim.status === 'REJECTED';
              const conversation = getConversationForClaim(claim.id);

              return (
                <div
                  key={claim.id}
                  className="card-feature p-6 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 animate-fade-up flex flex-col justify-between"
                  style={{ animationDelay: `${Math.min(idx * 60, 350)}ms` }}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                    isApproved ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' :
                    isRejected ? 'bg-red-500' : 'bg-gold-500'
                  }`} />
                  
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <span className={`badge mb-2.5 ${
                          isApproved ? 'badge-active shadow-sm' :
                          isRejected ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' :
                          'badge-pending shadow-sm'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isRejected && <XCircle className="w-3.5 h-3.5" />}
                          {!isApproved && !isRejected && <Clock className="w-3.5 h-3.5" />}
                          {claim.status}
                        </span>
                        <h3 className="text-base font-bold text-earth-900 dark:text-white line-clamp-1 group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors">
                          {claim.item?.title}
                        </h3>
                        <p className="text-xs font-semibold text-earth-400 dark:text-earth-400 mt-1">
                          Submitted on {new Date(claim.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      {claim.item?.imageUrls[0] ? (
                        <img src={claim.item.imageUrls[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-earth-200/80 dark:border-white/10 flex-shrink-0 group-hover:scale-108 transition-transform duration-300 shadow-inner" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-earth-100 dark:bg-black/50 border border-earth-200/80 dark:border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                          {claim.item?.category?.icon || '🔍'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-3">
                    <Link 
                      to={`/items/${claim.itemId}`}
                      className="btn-secondary flex-1 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      View Details <ExternalLink className="w-3.5 h-3.5 text-earth-400" />
                    </Link>

                    {isApproved && conversation && (
                      <button
                        onClick={() => navigate(`/messages?conversationId=${conversation.id}`)}
                        className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-gold-500/20 active:scale-98"
                      >
                        {claim.item?.type === 'LOST' ? 'Chat with Owner' : 'Chat with Finder'} <MessageCircle className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
