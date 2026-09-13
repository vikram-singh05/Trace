import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Tag, AlertCircle, Sparkles, Shield, CheckCircle2, Share2, ExternalLink } from 'lucide-react';
import { itemApi } from '../../api/itemApi';
import { useAuth } from '../../context/AuthContext';
import ClaimModal from '../../components/claims/ClaimModal';
import ManageClaims from '../../components/claims/ManageClaims';
import BackButton from '../../components/ui/BackButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import AlertModal from '../../components/ui/AlertModal';
import ImageModal from '../../components/ui/ImageModal';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemApi.getItemById(id!),
    enabled: !!id,
  });

  const resolveMutation = useMutation({
    mutationFn: () => itemApi.updateItem(item!.id, { status: 'RESOLVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setShowResolveConfirm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => itemApi.deleteItem(item!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to delete item');
      setShowDeleteConfirm(false);
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="relative p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-gold-500/25 animate-float border border-earth-200/50 dark:border-earth-700/50">
          <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="w-40 h-1.5 bg-earth-200 dark:bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 skeleton" />
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="relative p-8 flex flex-col items-center justify-center text-center min-h-[50vh] animate-fade-up">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-float">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="heading-2 mb-2">Item Listing Not Found</h1>
        <p className="body-text mb-6 max-w-sm">The listing you are searching for may have been resolved, archived, or removed.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary text-xs">
          ← Return to listings
        </button>
      </div>
    );
  }

  const isOwner = user?.id === item.reporter?.id;
  const isFound = item.type === 'FOUND';

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10">
      <div className="max-w-5xl mx-auto animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <button
            onClick={handleShare}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Link Copied!' : 'Share Listing'}
          </button>
        </div>

        <div className="card-feature overflow-hidden shadow-2xl">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 border-b border-earth-200/80 dark:border-white/[0.06] bg-earth-50/50 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`badge ${
                  isFound ? 'badge-found shadow-md shadow-emerald-500/15' : 'badge-lost shadow-md shadow-indigo-500/15'
                }`}>
                  {item.type}
                </span>
                <span className="badge bg-white/80 dark:bg-white/[0.05] text-earth-700 dark:text-earth-300 border-earth-200/80 dark:border-white/10 shadow-sm">
                  {item.category.icon} {item.category.name}
                </span>
                {item.status === 'ACTIVE' && (
                  <span className="badge badge-active shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                    Active
                  </span>
                )}
              </div>
              <h1 className="heading-1 text-earth-900 dark:text-white">{item.title}</h1>
              <p className="text-xs sm:text-sm text-earth-500 dark:text-earth-400 font-medium mt-2 flex items-center gap-1.5">
                Reported by <span className="text-earth-800 dark:text-earth-200 font-bold">{item.reporter?.name}</span>
                <span>•</span>
                <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
            
            <div className="flex flex-col md:items-end gap-3">
              <span className={`badge text-xs px-3 py-1.5 ${
                item.status === 'ACTIVE' ? 'badge-active' :
                item.status === 'RESOLVED' ? 'badge-resolved' :
                'badge-pending'
              }`}>
                Status: {item.status.replace('_', ' ')}
              </span>
              {isOwner && (
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Edit Listing
                  </Link>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                  {item.status === 'ACTIVE' && (
                    <button 
                      onClick={() => setShowResolveConfirm(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    >
                      ✓ Mark Resolved
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Photo Gallery & Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Photo Showcase */}
              {item.imageUrls.length > 0 && (
                <div className="space-y-3">
                  <div 
                    onClick={() => setPreviewImage(item.imageUrls[0])}
                    className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-earth-100 dark:bg-black/50 border border-earth-200/80 dark:border-white/10 cursor-pointer group relative shadow-inner"
                  >
                    <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-md transition-opacity">
                        🔍 Click to Expand
                      </span>
                    </div>
                  </div>
                  {item.imageUrls.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {item.imageUrls.map((url, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setPreviewImage(url)}
                          className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-earth-100 dark:bg-black/50 border border-earth-200/80 dark:border-white/10 cursor-pointer hover:ring-2 ring-gold-400 transition-all hover:scale-105"
                        >
                          <img src={url} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description Section */}
              <section>
                <h3 className="caption-text text-gold-600 dark:text-gold-400 font-extrabold mb-2">Item Description</h3>
                <div className="p-6 rounded-2xl bg-earth-50/70 dark:bg-white/[0.03] border border-earth-200/60 dark:border-white/[0.05] body-text leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </div>
              </section>

              {/* Verification Questions Box */}
              {item.verificationQuestions && item.verificationQuestions.length > 0 && (
                <section className="bg-gradient-to-br from-gold-500/10 via-amber-500/5 to-transparent border border-gold-500/20 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-gold-500" />
                    <h3 className="heading-3 text-earth-900 dark:text-white">Proof of Ownership Required</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-earth-500 dark:text-earth-400 font-medium mb-5">
                    To claim this item, submit answers to the verification questions below. The finder will review your responses to confirm ownership.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {item.verificationQuestions.map((q, i) => (
                      <li key={q.id} className="bg-white/80 dark:bg-white/[0.05] p-4 rounded-xl border border-earth-200/80 dark:border-white/10 text-earth-800 dark:text-earth-200 font-bold text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
                        <span className="w-5 h-5 rounded-md bg-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-black flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span>{q.question}</span>
                      </li>
                    ))}
                  </ul>
                  {!isOwner && item.status === 'ACTIVE' && (
                    <button 
                      onClick={() => setShowClaimModal(true)}
                      className="btn-primary w-full py-4 font-bold text-sm shadow-xl shadow-gold-500/25 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Submit Verification & Claim
                    </button>
                  )}
                </section>
              )}

              {/* Owner Claim Management */}
              {isOwner && <ManageClaims itemId={item.id} itemType={item.type} />}

              {/* AI Potential Matches Recommendation Card */}
              {isOwner && item.matches && item.matches.length > 0 && (
                <section className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/25 rounded-2xl p-6 sm:p-7">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="heading-3 text-earth-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      AI Potential Matches ({item.matches.length})
                    </h3>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/25">
                      Neural Engine
                    </span>
                  </div>
                  <div className="space-y-3">
                    {item.matches.map((match) => (
                      <Link 
                        key={match.id}
                        to={`/items/${match.item.id}`}
                        className="block bg-white/80 dark:bg-white/[0.04] p-4 rounded-xl border border-earth-200/80 dark:border-white/10 hover:border-indigo-400/50 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-earth-100 dark:bg-black/50 overflow-hidden flex-shrink-0 border border-earth-200 dark:border-white/10">
                            {match.item.imageUrls[0] ? (
                              <img src={match.item.imageUrls[0]} alt={match.item.title} className="w-full h-full object-cover group-hover:scale-108 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                {match.item.category?.icon || '🔍'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-earth-900 dark:text-white font-bold group-hover:text-indigo-500 transition-colors line-clamp-1">{match.item.title}</h4>
                            <p className="text-xs font-bold text-earth-500 mt-1">Match Confidence: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{match.score}%</span></p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {match.reasons.map((reason, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-earth-100 dark:bg-white/5 text-earth-600 dark:text-earth-300 border border-earth-200 dark:border-white/10 rounded-md text-[10px] font-extrabold uppercase tracking-wider">{reason}</span>
                              ))}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-earth-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Col: Metadata Sidebar */}
            <div className="space-y-6">
              <section className="card-feature p-6 bg-earth-50/50 dark:bg-white/[0.02]">
                <h3 className="caption-text text-gold-600 dark:text-gold-400 font-extrabold mb-5">Listing Metadata</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-white/[0.05] flex items-center justify-center text-earth-500 flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-earth-400 font-bold uppercase tracking-wider">Location</p>
                      <p className="text-sm font-bold text-earth-900 dark:text-white mt-0.5">{item.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-white/[0.05] flex items-center justify-center text-earth-500 flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-earth-400 font-bold uppercase tracking-wider">Date {isFound ? 'Found' : 'Lost'}</p>
                      <p className="text-sm font-bold text-earth-900 dark:text-white mt-0.5">
                        {new Date(item.dateOccurred).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  {item.brand && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-white/[0.05] flex items-center justify-center text-earth-500 flex-shrink-0 mt-0.5">
                        <Tag className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-earth-400 font-bold uppercase tracking-wider">Brand / Make</p>
                        <p className="text-sm font-bold text-earth-900 dark:text-white mt-0.5">{item.brand}</p>
                      </div>
                    </div>
                  )}
                  {item.color && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-white/[0.05] flex items-center justify-center text-earth-500 flex-shrink-0 mt-0.5">
                        <div className="w-4 h-4 rounded-full border border-earth-300 dark:border-white/20 shadow-sm" style={{ backgroundColor: item.color.toLowerCase().replace(' ', '') }} />
                      </div>
                      <div>
                        <p className="text-[11px] text-earth-400 font-bold uppercase tracking-wider">Color Swatch</p>
                        <p className="text-sm font-bold text-earth-900 dark:text-white mt-0.5">{item.color}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {item.tags.length > 0 && (
                <section className="card-feature p-6 bg-earth-50/50 dark:bg-white/[0.02]">
                  <h3 className="caption-text text-gold-600 dark:text-gold-400 font-extrabold mb-4">Tags & Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/80 dark:bg-white/[0.05] border border-earth-200/80 dark:border-white/10 rounded-lg text-xs font-bold text-earth-700 dark:text-earth-300 shadow-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {!isOwner && item.type === 'LOST' && item.status === 'ACTIVE' && (
                <button 
                  onClick={() => setShowClaimModal(true)}
                  className="btn-primary w-full py-4 font-bold text-sm shadow-xl shadow-gold-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  I Found This Lost Item
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
      
      {showClaimModal && (
        <ClaimModal
          itemId={item.id}
          itemType={item.type}
          questions={item.verificationQuestions || []}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => {
            setShowClaimModal(false);
            setShowClaimSuccess(true);
          }}
        />
      )}

      {showResolveConfirm && (
        <ConfirmModal
          title="Mark Listing as Resolved?"
          message="Are you sure you want to mark this item as resolved? This confirms the item has been reunited successfully."
          confirmText={resolveMutation.isPending ? "Resolving..." : "Resolve Listing"}
          onConfirm={() => resolveMutation.mutate()}
          onCancel={() => setShowResolveConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Listing?"
          message="Are you sure you want to delete this listing? This action cannot be undone."
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showClaimSuccess && (
        <AlertModal
          title={item.type === 'LOST' ? "You're Connected!" : "Verification Submitted!"}
          message={item.type === 'LOST'
            ? "A secure chat with the owner is now open — find it under Messages to coordinate returning the item."
            : "Your claim responses have been delivered to the finder for review. You will receive an instant notification once verified."}
          onClose={() => setShowClaimSuccess(false)}
        />
      )}

      {previewImage && (
        <ImageModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
