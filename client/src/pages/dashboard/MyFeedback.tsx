import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, PlusCircle } from 'lucide-react';
import { feedbackApi } from '../../api/feedbackApi';

export default function MyFeedback() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['myFeedbacks'],
    queryFn: () => feedbackApi.getUserFeedbacks(),
  });

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10">
      <div className="max-w-6xl mx-auto animate-fade-up">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="gold-accent" />
              <span className="caption-text text-gold-600 dark:text-gold-400 font-bold">Help & Feedback</span>
            </div>
            <h1 className="heading-1">My Feedback & Reports</h1>
            <p className="body-text mt-1 text-sm sm:text-base font-medium">Keep track of your submitted bug reports, issues, and feature requests.</p>
          </div>
          <Link to="/support" className="btn-primary whitespace-nowrap shadow-lg shadow-gold-500/25">
            <PlusCircle className="w-4 h-4" />
            Submit New Report
          </Link>
        </div>

        {isLoading ? (
          <div className="card-feature p-8 space-y-4 animate-fade-up">
            <div className="h-6 w-48 skeleton rounded" />
            <div className="space-y-3 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-600 dark:text-red-400 font-bold flex gap-2 animate-fade-up">
            <span>⚠</span> Failed to load your reports. Please check your connection.
          </div>
        ) : data?.data?.feedbacks?.length === 0 ? (
          <div className="card-feature p-14 text-center animate-fade-up">
            <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/25 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float shadow-inner">
              <MessageSquare className="w-10 h-10 text-gold-500" />
            </div>
            <h3 className="heading-3 mb-2">No Reports Yet</h3>
            <p className="body-text mb-6 max-w-sm mx-auto">You haven't submitted any feedback or bug reports yet.</p>
            <Link to="/support" className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-gold-500/25">
              <Sparkles className="w-4 h-4" />
              Submit your first report
            </Link>
          </div>
        ) : (
          <div className="card-feature overflow-hidden animate-fade-up shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-earth-50/80 dark:bg-white/[0.03] text-earth-400 dark:text-earth-400 text-xs font-extrabold uppercase tracking-wider border-b border-earth-200/80 dark:border-white/[0.06]">
                    <th className="p-5">Report Title</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-white/[0.04]">
                  {data?.data?.feedbacks?.map((item: any, idx: number) => (
                    <tr
                      key={item.id}
                      className="hover:bg-earth-50/70 dark:hover:bg-white/[0.03] transition-colors group animate-fade-up"
                      style={{ animationDelay: `${Math.min(idx * 40, 350)}ms` }}
                    >
                      <td className="p-5">
                        <div className="font-bold text-earth-900 dark:text-white line-clamp-1 max-w-xs md:max-w-md">{item.title}</div>
                        <div className="text-xs text-earth-500 line-clamp-1 max-w-xs md:max-w-md mt-1">{item.description}</div>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-bold px-2 py-1 bg-earth-100 dark:bg-earth-800 rounded">
                          {item.type}
                        </span>
                        {item.severity && <span className="text-[10px] text-red-500 ml-2 uppercase font-bold">{item.severity}</span>}
                      </td>
                      <td className="p-5">
                        <span className={`badge ${
                            item.status === 'OPEN' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                            item.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            item.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            'bg-earth-500/10 text-earth-600 border border-earth-500/20'
                          }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-5 text-right text-xs font-semibold text-earth-500 dark:text-earth-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
