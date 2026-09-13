import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { reportApi, type UserReport } from '../../api/reportApi';
import type { User } from '../../api/adminApi';
import type { Item } from '../../api/itemApi';
import { Users, ShieldAlert, Activity, Search, Ban, CheckCircle2, Trash2, RotateCcw, Shield, MapPin, Sparkles, BarChart2, X, MessageSquare } from 'lucide-react';
import AnimatedCount from '../../components/ui/AnimatedCount';
import ConfirmModal from '../../components/ui/ConfirmModal';
import AdminChatLogModal from '../../components/admin/AdminChatLogModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'ITEMS' | 'REPORTS'>('OVERVIEW');

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto relative animate-fade-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 flex items-center justify-center shadow-lg shadow-gold-500/25">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="gold-accent" />
                <span className="caption-text text-gold-600 dark:text-gold-400 font-extrabold">Executive Panel</span>
              </div>
              <h1 className="heading-1 flex items-center gap-3">
                Admin Portal
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/25">
                  Restricted
                </span>
              </h1>
              <p className="body-text mt-0.5 text-sm sm:text-base font-medium">Oversee network activity, audit users, and manage listing moderation.</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex gap-1.5 mb-8 p-1.5 rounded-2xl bg-earth-100/70 dark:bg-white/[0.04] border border-earth-200/80 dark:border-white/10 backdrop-blur-xl w-fit shadow-inner overflow-x-auto max-w-full">
          {(['OVERVIEW', 'USERS', 'ITEMS', 'REPORTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-md shadow-gold-500/25 scale-102'
                  : 'text-earth-600 dark:text-earth-300 hover:text-earth-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.08]'
              }`}
            >
              {tab === 'OVERVIEW' ? 'Live Overview & Analytics' : tab === 'USERS' ? 'User Directory' : tab === 'ITEMS' ? 'Item Moderation' : 'User Reports'}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && <OverviewTab />}
        {activeTab === 'USERS' && <UsersTab />}
        {activeTab === 'ITEMS' && <ItemsTab />}
        {activeTab === 'REPORTS' && <ReportsTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Overview Tab with Recharts
// ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-feature p-6 space-y-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="w-12 h-12 rounded-xl skeleton" />
            <div className="h-3 w-20 skeleton rounded" />
            <div className="h-8 w-16 skeleton rounded-lg" />
          </div>
        ))}
      </div>
    );
  }
  if (!stats) return null;

  const statCards = [
    { title: 'Registered Users', value: stats.totalUsers, icon: <Users className="w-6 h-6 text-indigo-500" />, border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
    { title: 'Active Listings', value: stats.activeItems, icon: <Activity className="w-6 h-6 text-emerald-500" />, border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    { title: 'Reunited Valuables', value: stats.resolvedItems, icon: <CheckCircle2 className="w-6 h-6 text-gold-500" />, border: 'border-gold-500/30', bg: 'bg-gold-500/10' },
    { title: 'AI Match Suggestions', value: stats.totalMatches, icon: <ShieldAlert className="w-6 h-6 text-amber-500" />, border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  ];

  // Mock data for advanced analytics visualization
  const mockActivityData = [
    { name: 'Mon', reports: 12, resolved: 4 },
    { name: 'Tue', reports: 19, resolved: 7 },
    { name: 'Wed', reports: 15, resolved: 10 },
    { name: 'Thu', reports: 22, resolved: 12 },
    { name: 'Fri', reports: 30, resolved: 18 },
    { name: 'Sat', reports: 25, resolved: 15 },
    { name: 'Sun', reports: 18, resolved: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={stat.title} className="card-feature p-6 hover:-translate-y-2 transition-all duration-300 animate-fade-up flex flex-col justify-between" style={{ animationDelay: `${idx * 70}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center shadow-inner`}>{stat.icon}</div>
              <Sparkles className="w-3.5 h-3.5 text-gold-400 opacity-60" />
            </div>
            <div>
              <p className="caption-text mb-1 text-earth-400 font-extrabold">{stat.title}</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-earth-900 dark:text-white tracking-tight">
                <AnimatedCount value={stat.value} duration={900} />
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <div className="card-feature p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-gold-500" />
            <h3 className="text-lg font-bold text-earth-900 dark:text-white">Weekly Activity Overview</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-feature p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-earth-900 dark:text-white">Resolution Rate Comparison</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reports" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Users Tab
// ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page, search],
    queryFn: () => adminApi.getUsers(page, search),
    placeholderData: (prev) => prev,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  return (
    <div className="card-feature overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-earth-200/80 dark:border-white/[0.06] bg-earth-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="heading-3 text-earth-900 dark:text-white">User Directory</h2>
          <p className="text-xs text-earth-500 dark:text-earth-400 font-medium mt-0.5">Manage user permissions and account statuses.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-earth-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-11 text-xs font-medium sm:w-72"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-earth-50/80 dark:bg-white/[0.02] text-earth-400 dark:text-earth-400 text-xs font-extrabold uppercase tracking-wider border-b border-earth-200/80 dark:border-white/[0.06]">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Activity Count</th>
              <th className="px-6 py-4">Registered Date</th>
              <th className="px-6 py-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100 dark:divide-white/[0.04]">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center body-text">Loading user directory...</td></tr>
            ) : data?.users.map((user: User, idx: number) => (
              <tr key={user.id} className="hover:bg-earth-50/70 dark:hover:bg-white/[0.03] transition-colors animate-fade-up" style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}>
                <td className="px-6 py-4">
                  <div className="font-bold text-earth-900 dark:text-white">{user.name}</div>
                  <div className="text-earth-400 dark:text-earth-400 text-xs font-semibold">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${user.role === 'ADMIN' ? 'bg-gold-500/15 text-gold-600 dark:text-gold-400 border-gold-500/25' : 'badge-resolved'}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-earth-600 dark:text-earth-300">
                  <span className="text-gold-600 dark:text-gold-400 font-extrabold">{user._count.items}</span> reports • <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{user._count.claims}</span> claims
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-earth-500 dark:text-earth-400">
                  {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => toggleStatus.mutate({ id: user.id, isActive: !user.isActive })}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                        user.isActive 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 hover:bg-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                      }`}
                    >
                      {user.isActive ? <span className="flex items-center justify-center gap-1.5"><Ban className="w-3.5 h-3.5"/>Ban User</span> : 'Restore Access'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data && data.pages > 1 && (
        <div className="p-4 border-t border-earth-200/80 dark:border-white/[0.06] flex justify-center items-center gap-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-5 py-2 disabled:opacity-40">Previous</button>
          <span className="text-xs font-bold text-earth-500 dark:text-earth-400">Page {page} of {data.pages}</span>
          <button disabled={page === data.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-5 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Items Tab (Moderation)
// ─────────────────────────────────────────────────────────────────
function ItemsTab() {
  const [page, setPage] = useState(1);
  const [itemToPurge, setItemToPurge] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminItems', page],
    queryFn: () => adminApi.getItems(page),
    placeholderData: (prev) => prev,
  });

  const moderateItem = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'DELETE' | 'RESTORE' | 'HARD_DELETE' }) => adminApi.moderateItem(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
    },
  });

  return (
    <div className="card-feature overflow-hidden animate-fade-up shadow-2xl">
      <div className="p-6 border-b border-earth-200/80 dark:border-white/[0.06] bg-earth-50/50 dark:bg-white/[0.02]">
        <h2 className="heading-3 text-earth-900 dark:text-white">Content Moderation Queue</h2>
        <p className="text-xs text-earth-500 dark:text-earth-400 font-medium mt-0.5">Audit reports for community guidelines compliance and remove inappropriate items.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center body-text">Loading moderation items...</div>
        ) : data?.items.map((item: Item, idx: number) => (
          <div key={item.id} className={`flex flex-col overflow-hidden rounded-2xl border transition-colors animate-fade-up ${item.deletedAt ? 'bg-red-500/5 border-red-500/20 opacity-75' : 'bg-white/50 dark:bg-white/[0.02] border-earth-200 dark:border-white/10 hover:border-gold-500/30 shadow-md'}`} style={{ animationDelay: `${Math.min(idx * 40, 350)}ms` }}>
            <div className="h-40 w-full bg-earth-100 dark:bg-black/50 overflow-hidden relative border-b border-earth-200 dark:border-white/10">
              {item.imageUrls[0] ? (
                <img src={item.imageUrls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">{item.category?.icon}</div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`badge ${item.type === 'FOUND' ? 'badge-found shadow-sm' : 'badge-lost shadow-sm'}`}>{item.type}</span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-base font-bold text-earth-900 dark:text-white line-clamp-1 mb-1">{item.title}</h3>
              <p className="body-text text-xs line-clamp-2 mb-4">{item.description}</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-earth-500 dark:text-earth-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-gold-500" /> {item.reporter?.name}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {item.location}</span>
                </div>
                
                <div className="pt-4 border-t border-earth-200 dark:border-white/10 flex gap-2">
                  {item.deletedAt ? (
                    <>
                      <button onClick={() => moderateItem.mutate({ id: item.id, action: 'RESTORE' })} className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm">
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-500" /> Restore
                      </button>
                      <button onClick={() => setItemToPurge(item.id)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm" title="Remove from database permanently">
                        <Trash2 className="w-3.5 h-3.5" /> Purge
                      </button>
                    </>
                  ) : (
                    <button onClick={() => moderateItem.mutate({ id: item.id, action: 'DELETE' })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 text-xs font-bold transition-all active:scale-95 shadow-sm" title="Hide from public view">
                      <Ban className="w-3.5 h-3.5" /> Soft Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="p-4 border-t border-earth-200/80 dark:border-white/[0.06] flex justify-center items-center gap-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-5 py-2 disabled:opacity-40">Previous</button>
          <span className="text-xs font-bold text-earth-500 dark:text-earth-400">Page {page} of {data.pages}</span>
          <button disabled={page === data.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-5 py-2 disabled:opacity-40">Next</button>
        </div>
      )}

      {itemToPurge && (
        <ConfirmModal
          title="Permanently Delete Item?"
          message="Are you sure you want to permanently delete this from the database? This action cannot be undone."
          danger={true}
          confirmText={moderateItem.isPending ? "Purging..." : "Purge"}
          onConfirm={() => {
            moderateItem.mutate(
              { id: itemToPurge, action: 'HARD_DELETE' },
              { onSettled: () => setItemToPurge(null) }
            );
          }}
          onCancel={() => setItemToPurge(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reports Tab
// ─────────────────────────────────────────────────────────────────
function ReportsTab() {
  const queryClient = useQueryClient();
  const [chatLogContext, setChatLogContext] = useState<{
    conversationId: string;
    reportedUserName: string;
    reporterName: string;
    reason: string;
  } | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: reportApi.getReports,
  });

  const updateReportStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'REVIEWED' | 'DISMISSED' }) => reportApi.updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  return (
    <div className="card-feature overflow-hidden shadow-2xl animate-fade-up">
      <div className="p-6 border-b border-earth-200/80 dark:border-white/[0.06] bg-earth-50/50 dark:bg-white/[0.02]">
        <h2 className="heading-3 text-earth-900 dark:text-white">User Reports & Moderation</h2>
        <p className="text-xs text-earth-500 dark:text-earth-400 font-medium mt-0.5">Review abuse reports and manage user access.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-earth-50/80 dark:bg-white/[0.02] text-earth-400 dark:text-earth-400 text-xs font-extrabold uppercase tracking-wider border-b border-earth-200/80 dark:border-white/[0.06]">
              <th className="px-6 py-4">Report Details</th>
              <th className="px-6 py-4">Reported By</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Context</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100 dark:divide-white/[0.04]">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center body-text">Loading reports...</td></tr>
            ) : reports?.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center body-text">No reports found.</td></tr>
            ) : reports?.map((report: UserReport, idx: number) => (
              <tr key={report.id} className="hover:bg-earth-50/70 dark:hover:bg-white/[0.03] transition-colors animate-fade-up" style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}>
                <td className="px-6 py-4">
                  <div className="font-bold text-earth-900 dark:text-white flex items-center gap-2">
                    <span className="text-red-500">{report.type.replace('_', ' ')}</span>
                    {!report.reportedUser.isActive && <span className="badge bg-red-500/10 text-red-500 border border-red-500/20">Banned</span>}
                  </div>
                  <div className="text-earth-600 dark:text-earth-400 text-xs mt-1 max-w-md italic border-l-2 border-earth-200 dark:border-earth-700 pl-2">
                    "{report.reason}"
                  </div>
                  <div className="text-earth-400 text-xs font-semibold mt-1">
                    Reported User: {report.reportedUser.name} ({report.reportedUser.email})
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-earth-900 dark:text-white">{report.reporter.name}</div>
                  <div className="text-earth-400 text-xs">{new Date(report.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    report.status === 'PENDING' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' : 
                    report.status === 'REVIEWED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' : 
                    'bg-earth-500/15 text-earth-600 dark:text-earth-400 border-earth-500/25'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {report.conversation?.id ? (
                    <button
                      onClick={() => setChatLogContext({
                        conversationId: report.conversation!.id,
                        reportedUserName: report.reportedUser.name,
                        reporterName: report.reporter.name,
                        reason: report.reason
                      })}
                      className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 shadow-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/20 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> View Chat Log
                    </button>
                  ) : (
                    <span className="text-xs text-earth-400 italic">No chat linked</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-y-2">
                  <div className="flex justify-end gap-2">
                    {report.reportedUser.isActive ? (
                      <button
                        onClick={() => {
                          toggleUserStatus.mutate({ id: report.reportedUser.id, isActive: false });
                          if (report.status === 'PENDING') updateReportStatus.mutate({ id: report.id, status: 'REVIEWED' });
                        }}
                        className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 shadow-sm bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 hover:bg-red-500/20 flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" /> Ban User
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleUserStatus.mutate({ id: report.reportedUser.id, isActive: true })}
                        className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 shadow-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Unban User
                      </button>
                    )}
                    {report.status === 'PENDING' && (
                      <button
                        onClick={() => updateReportStatus.mutate({ id: report.id, status: 'DISMISSED' })}
                        className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 shadow-sm bg-earth-500/10 text-earth-600 dark:text-earth-400 border border-earth-500/25 hover:bg-earth-500/20 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Dismiss
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chatLogContext && (
        <AdminChatLogModal
          isOpen={!!chatLogContext}
          onClose={() => setChatLogContext(null)}
          conversationId={chatLogContext.conversationId}
          reportDetails={{
            reportedUserName: chatLogContext.reportedUserName,
            reporterName: chatLogContext.reporterName,
            reason: chatLogContext.reason
          }}
        />
      )}
    </div>
  );
}
