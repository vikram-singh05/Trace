import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, ExternalLink, PackageOpen, PlusCircle } from 'lucide-react';
import { itemApi } from '../../api/itemApi';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function MyReports() {
  const queryClient = useQueryClient();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myItems'],
    queryFn: () => itemApi.getMyItems({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myItems'] });
    },
  });

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10">
      <div className="max-w-6xl mx-auto animate-fade-up">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="gold-accent" />
              <span className="caption-text text-gold-600 dark:text-gold-400 font-bold">Manage Reports</span>
            </div>
            <h1 className="heading-1">My Reported Listings</h1>
            <p className="body-text mt-1 text-sm sm:text-base font-medium">Keep track of your active, pending, and resolved listings.</p>
          </div>
          <Link to="/report" className="btn-primary whitespace-nowrap shadow-lg shadow-gold-500/25">
            <PlusCircle className="w-4 h-4" />
            Create Report
          </Link>
        </div>

        {isLoading ? (
          <div className="card-feature p-8 space-y-4 animate-fade-up">
            <div className="h-6 w-48 skeleton rounded" />
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-600 dark:text-red-400 font-bold flex gap-2 animate-fade-up">
            <span>⚠</span> Failed to load your reports. Please check your connection.
          </div>
        ) : data?.items.length === 0 ? (
          <div className="card-feature p-14 text-center animate-fade-up">
            <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/25 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float shadow-inner">
              <PackageOpen className="w-10 h-10 text-gold-500" />
            </div>
            <h3 className="heading-3 mb-2">No Reports Yet</h3>
            <p className="body-text mb-6 max-w-sm mx-auto">You haven't reported any lost or found items yet.</p>
            <Link to="/report" className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-gold-500/25">
              <PlusCircle className="w-4 h-4" />
              Create your first report
            </Link>
          </div>
        ) : (
          <div className="card-feature overflow-hidden animate-fade-up shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-earth-50/80 dark:bg-white/[0.03] text-earth-400 dark:text-earth-400 text-xs font-extrabold uppercase tracking-wider border-b border-earth-200/80 dark:border-white/[0.06]">
                    <th className="p-5">Listing</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Date Created</th>
                    <th className="p-5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-white/[0.04]">
                  {data?.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-earth-50/70 dark:hover:bg-white/[0.03] transition-colors group animate-fade-up"
                      style={{ animationDelay: `${Math.min(idx * 40, 350)}ms` }}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-earth-100 dark:bg-black/50 overflow-hidden flex-shrink-0 border border-earth-200/80 dark:border-white/10 group-hover:border-gold-500/50 transition-colors shadow-inner">
                            {item.imageUrls[0] ? (
                               <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-lg">
                                 {item.category.icon}
                                </div>
                             )}
                          </div>
                          <div>
                            <Link to={`/items/${item.id}`} className="font-bold text-earth-900 dark:text-white hover:text-gold-500 dark:hover:text-gold-400 transition-colors line-clamp-1 text-sm">
                              {item.title}
                            </Link>
                            <p className="text-xs font-semibold text-earth-400 dark:text-earth-400 mt-0.5">{item.category.name} • {item.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`badge ${
                          item.type === 'FOUND' ? 'badge-found shadow-sm' : 'badge-lost shadow-sm'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`badge ${
                          item.status === 'ACTIVE' ? 'badge-active' :
                          item.status === 'RESOLVED' ? 'badge-resolved' :
                          'badge-pending'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-5 text-xs font-semibold text-earth-500 dark:text-earth-400">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/items/${item.id}`}
                            className="p-2 text-earth-500 hover:text-gold-600 hover:bg-gold-500/10 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-gold-500/20"
                            title="View Listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/items/${item.id}/edit`}
                            className="p-2 text-earth-500 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-indigo-500/20"
                            title="Edit Listing"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-earth-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-red-500/20"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {itemToDelete && (
        <ConfirmModal
          title="Delete Report?"
          message="Are you sure you want to permanently delete this report? This cannot be undone."
          danger={true}
          confirmText="Delete Report"
          onConfirm={() => {
            deleteMutation.mutate(itemToDelete);
            setItemToDelete(null);
          }}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}
