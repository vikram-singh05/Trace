import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { claimApi } from '../../api/claimApi';
import { chatApi } from '../../api/chatApi';
import { useState } from 'react';
import { Check, X, ShieldAlert, FileText, Loader2, User, MessageCircle } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

export default function ManageClaims({ itemId, itemType }: { itemId: string, itemType: 'LOST' | 'FOUND' }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: claims, isLoading, isError } = useQuery({
    queryKey: ['claims', itemId],
    queryFn: () => claimApi.getClaimsForItem(itemId),
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
  });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, claimId: string | null, status: 'APPROVED' | 'REJECTED' | null }>({
    isOpen: false,
    claimId: null,
    status: null
  });

  const updateMutation = useMutation({
    mutationFn: ({ claimId, status }: { claimId: string; status: 'APPROVED' | 'REJECTED' }) =>
      claimApi.updateClaimStatus(claimId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', itemId] });
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleUpdateStatus = (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'APPROVED') {
      setConfirmState({ isOpen: true, claimId, status });
    } else {
      updateMutation.mutate({ claimId, status });
    }
  };

  const openChat = (claimId: string) => {
    const conv = conversations?.find(c => c.claimId === claimId);
    if (conv) {
      navigate(`/messages?conversationId=${conv.id}`);
    }
  };

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>;
  if (isError) return <div className="p-4 bg-danger-light dark:bg-danger-dark/30 text-red-700 dark:text-red-400 rounded-xl font-medium">Failed to load claims.</div>;
  if (!claims || claims.length === 0) return null;

  return (
    <section className="bg-gold-50/30 dark:bg-gold-900/10 border border-gold-200/50 dark:border-gold-800/30 rounded-2xl p-6 mt-8">
      <h3 className="heading-3 mb-6 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-gold-500" />
        {itemType === 'FOUND' ? `Ownership Claims (${claims.length})` : `People Who Found This Item (${claims.length})`}
      </h3>

      <div className="space-y-5">
        {claims.map((claim) => (
          <div key={claim.id} className="card-standard p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${claim.status === 'APPROVED' ? 'bg-emerald-500' :
                claim.status === 'REJECTED' ? 'bg-red-400' : 'bg-amber-400'
              }`} />

            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-5 pl-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-earth-100 dark:bg-earth-800/50 flex items-center justify-center border border-earth-200 dark:border-earth-700">
                  {claim.claimant?.avatarUrl ? (
                    <img src={claim.claimant.avatarUrl} alt="avatar" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-earth-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-earth-900 dark:text-earth-100 font-semibold">{claim.claimant?.name || 'Anonymous User'}</h4>
                  <p className="text-xs text-earth-500 dark:text-earth-400">{new Date(claim.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <span className={`badge ${claim.status === 'APPROVED' ? 'badge-active' :
                  claim.status === 'REJECTED' ? 'bg-danger-light text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30' :
                    'badge-pending'
                }`}>
                {itemType === 'LOST' && claim.status === 'APPROVED' ? 'CONNECTED' : claim.status}
              </span>
            </div>

            <div className="space-y-2 mb-5 pl-3">
              <h5 className="caption-text mb-2">Answers Provided</h5>
              {claim.answers.map((ans) => (
                <div key={ans.id} className="bg-earth-50 dark:bg-earth-800/30 p-3 rounded-xl border border-earth-100 dark:border-earth-700/40">
                  <span className="text-sm text-earth-800 dark:text-earth-200 font-medium">A: {ans.answer}</span>
                </div>
              ))}
            </div>

            {claim.proofText && (
              <div className="pl-3 mb-5">
                <h5 className="caption-text mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Additional Proof
                </h5>
                <p className="text-sm text-earth-600 dark:text-earth-400 italic bg-earth-50 dark:bg-earth-800/30 p-3 rounded-xl border border-earth-100 dark:border-earth-700/40">
                  "{claim.proofText}"
                </p>
              </div>
            )}

            {claim.status === 'PENDING' && itemType === 'FOUND' && (
              <div className="flex gap-3 pt-4 border-t border-earth-100 dark:border-earth-700/40 pl-3">
                <button
                  onClick={() => handleUpdateStatus(claim.id, 'APPROVED')}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-all flex justify-center items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(claim.id, 'REJECTED')}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all flex justify-center items-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            )}

            {((itemType === 'LOST') || (claim.status === 'APPROVED' && itemType === 'FOUND')) && claim.claimant?.email && (
              <div className="mt-4 pl-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-emerald-700 dark:text-emerald-400">
                  {itemType === 'LOST' ? (
                    <>This user has found your item! Email: <strong>{claim.claimant.email}</strong></>
                  ) : (
                    <>You have approved this claim! Email: <strong>{claim.claimant.email}</strong></>
                  )}
                </div>

                {conversations?.find(c => c.claimId === claim.id) && (
                  <button
                    onClick={() => openChat(claim.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" /> Open Secure Chat
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmState.isOpen && confirmState.claimId && confirmState.status && (
        <ConfirmModal
          title="Approve Claim?"
          message="Are you sure you want to approve this claim? This will resolve the item and automatically reject all other claims."
          onConfirm={() => updateMutation.mutate({ claimId: confirmState.claimId!, status: confirmState.status! })}
          onCancel={() => setConfirmState({ isOpen: false, claimId: null, status: null })}
          confirmText="Approve Claim"
        />
      )}
    </section>
  );
}
