import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Calendar, LayoutGrid, PlusCircle, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { itemApi } from '../../api/itemApi';
import type { QueryItemInput } from '../../api/itemApi';
import { categoryApi } from '../../api/categoryApi';
import CustomDropdown from '../../components/ui/CustomDropdown';

export default function BrowseItems() {
  const [filters, setFilters] = useState<QueryItemInput>({
    page: 1,
    limit: 12,
    type: undefined,
    categoryId: undefined,
    status: 'ACTIVE',
    search: '',
  });

  const [searchInput, setSearchInput] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemApi.getItems(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key: keyof QueryItemInput, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 12,
      type: undefined,
      categoryId: undefined,
      status: 'ACTIVE',
      search: '',
    });
  };

  const hasActiveFilters = Boolean(filters.type || filters.categoryId || filters.search || (filters.status && filters.status !== 'ACTIVE'));

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10 min-h-screen overflow-hidden bg-earth-50 dark:bg-earth-950 transition-colors duration-500">
      
      {/* ── Background Elements ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full filter blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-earth-500/10 rounded-full filter blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse-glow" />
              <span className="caption-text font-bold text-gold-600 dark:text-gold-400">Directory</span>
            </div>
            <h1 className="heading-1 text-earth-900 dark:text-white">Explore Listings</h1>
            <p className="body-text mt-2 text-sm sm:text-base text-earth-600 dark:text-earth-400">Search, filter, and track items across all locations.</p>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/report"
              className="btn-primary whitespace-nowrap shadow-lg shadow-gold-500/20 bg-gradient-to-br from-gold-500 to-gold-600 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              Report New Item
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Category Quick Filter Chips ── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 overflow-x-auto pb-2 scrollbar-none"
        >
          <div className="flex items-center gap-2 min-w-max">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange('categoryId', undefined)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                !filters.categoryId
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-md shadow-gold-500/20'
                  : 'bg-white/60 dark:bg-earth-900/40 text-earth-700 dark:text-earth-300 border border-earth-200/50 dark:border-earth-800/50 hover:bg-white/90 dark:hover:bg-earth-800 backdrop-blur-md'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>All Categories</span>
            </motion.button>
            {categories.map((cat) => {
              const isSelected = filters.categoryId === cat.id;
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={cat.id}
                  onClick={() => handleFilterChange('categoryId', isSelected ? undefined : cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-md shadow-gold-500/20'
                      : 'bg-white/60 dark:bg-earth-900/40 text-earth-700 dark:text-earth-300 border border-earth-200/50 dark:border-earth-800/50 hover:bg-white/90 dark:hover:bg-earth-800 backdrop-blur-md'
                  }`}
                >
                  <span className="text-base leading-none drop-shadow-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Type Selector Tabs & Search Filter Bar ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-50 bg-white/40 dark:bg-earth-900/40 backdrop-blur-3xl backdrop-saturate-200 border border-earth-200/50 dark:border-earth-800/50 p-4 rounded-3xl mb-10 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="flex flex-col lg:flex-row items-center gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by keyword, brand, location..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl border border-earth-200/60 dark:border-earth-700/50 bg-white/60 dark:bg-earth-950/40 text-earth-900 dark:text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all placeholder:text-earth-400 font-medium shadow-inner"
              />
              <AnimatePresence>
                {searchInput && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setFilters(prev => ({ ...prev, search: '', page: 1 }));
                    }}
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-earth-400 hover:text-gold-500 p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold shadow-md shadow-gold-500/20"
              >
                Search
              </motion.button>
            </form>

            {/* Type Segmented Buttons */}
            <div className="flex items-center p-1.5 bg-earth-100/50 dark:bg-earth-950/50 rounded-2xl w-full lg:w-auto shadow-inner border border-earth-200/50 dark:border-earth-800/50">
              <button
                onClick={() => handleFilterChange('type', undefined)}
                className={`flex-1 lg:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  !filters.type
                    ? 'bg-white dark:bg-earth-800 text-earth-900 dark:text-white shadow-sm border border-earth-200/50 dark:border-earth-700/50'
                    : 'text-earth-500 hover:text-earth-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('type', 'LOST')}
                className={`flex-1 lg:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 justify-center ${
                  filters.type === 'LOST'
                    ? 'bg-white dark:bg-earth-800 text-earth-900 dark:text-white shadow-sm border border-earth-200/50 dark:border-earth-700/50'
                    : 'text-earth-500 hover:text-earth-900 dark:hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${filters.type === 'LOST' ? 'bg-red-500 animate-pulse-glow' : 'bg-red-500/50'}`} /> Lost
              </button>
              <button
                onClick={() => handleFilterChange('type', 'FOUND')}
                className={`flex-1 lg:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 justify-center ${
                  filters.type === 'FOUND'
                    ? 'bg-white dark:bg-earth-800 text-earth-900 dark:text-white shadow-sm border border-earth-200/50 dark:border-earth-700/50'
                    : 'text-earth-500 hover:text-earth-900 dark:hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${filters.type === 'FOUND' ? 'bg-emerald-500 animate-pulse-glow' : 'bg-emerald-500/50'}`} /> Found
              </button>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <CustomDropdown
                value={filters.status || ''}
                onChange={(value) => handleFilterChange('status', value)}
                options={[
                  { value: 'ACTIVE', label: 'Active Listings' },
                  { value: 'RESOLVED', label: 'Resolved Only' },
                  { value: '', label: 'All Statuses' }
                ]}
                className="w-full lg:w-[180px]"
              />

              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="p-3.5 rounded-2xl bg-white/60 dark:bg-earth-900/50 border border-earth-200/50 dark:border-earth-700/50 hover:border-gold-500 hover:text-gold-500 text-earth-500 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Reset all filters"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Results ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 perspective-container">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/40 dark:bg-earth-900/30 rounded-3xl overflow-hidden animate-pulse border border-earth-200/50 dark:border-earth-800/50">
                <div className="aspect-[4/3] bg-earth-200/50 dark:bg-earth-800/50" />
                <div className="p-5 space-y-4">
                  <div className="h-4 w-24 bg-earth-200/50 dark:bg-earth-800/50 rounded-full" />
                  <div className="h-5 w-3/4 bg-earth-200/50 dark:bg-earth-800/50 rounded-full" />
                  <div className="pt-4 border-t border-earth-200/50 dark:border-earth-700/30 space-y-2">
                    <div className="h-3 w-1/2 bg-earth-200/50 dark:bg-earth-800/50 rounded-full" />
                    <div className="h-3 w-1/3 bg-earth-200/50 dark:bg-earth-800/50 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 font-bold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-3xl shadow-sm">
            Failed to load the database. Please initialize a retry.
          </div>
        ) : data?.items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white/40 dark:bg-earth-900/40 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl border border-earth-200/50 dark:border-earth-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gold-500/20 to-amber-500/20 text-gold-500 border border-gold-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-2">No items detected</h3>
            <p className="text-sm text-earth-500 max-w-sm mx-auto mb-8 font-medium">Try broadening your search term or clearing the active filters.</p>
            {hasActiveFilters && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters} 
                className="btn-primary px-8 bg-gradient-to-r from-gold-500 to-gold-600 border-gold-600/50"
              >
                Clear all filters
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Item Cards Grid */}
            <motion.div
              key={`${filters.page}-${filters.type}-${filters.categoryId}-${filters.status}-${filters.search}`}
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {}
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 perspective-container"
            >
              {data?.items.map((item) => {
                const isFound = item.type === 'FOUND';
                return (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                  >
                    <Link
                      to={`/items/${item.id}`}
                      className="group block overflow-hidden transform-3d h-full bg-white/60 dark:bg-earth-900/30 backdrop-blur-2xl backdrop-saturate-150 border border-earth-200/60 dark:border-earth-700/50 rounded-3xl hover:border-gold-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] transition-all duration-300"
                    >
                      {/* Image Preview */}
                      <div className="aspect-[4/3] bg-earth-100 dark:bg-earth-900 relative overflow-hidden border-b border-earth-200/50 dark:border-earth-700/50">
                        {item.imageUrls.length > 0 ? (
                          <>
                            <img
                              src={item.imageUrls[0]}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-earth-400 group-hover:bg-earth-200 dark:group-hover:bg-earth-800 transition-colors duration-300">
                            <span className="text-4xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">{item.category.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-earth-500">No Image</span>
                          </div>
                        )}
                        
                        {/* Status Indicator */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg tracking-wider shadow-md backdrop-blur-md border ${isFound ? 'bg-emerald-500/90 text-white border-emerald-400/50' : 'bg-red-500/90 text-white border-red-400/50'}`}>
                            {item.type}
                          </span>
                        </div>
                        
                        {item.imageUrls.length > 1 && (
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-white/90 dark:bg-earth-900/90 backdrop-blur-md text-[11px] font-bold text-earth-900 dark:text-white shadow-lg border border-earth-200/50 dark:border-earth-700/50">
                            +{item.imageUrls.length - 1} photos
                          </div>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col relative">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-earth-500 uppercase tracking-widest mb-2">
                          <span className="drop-shadow-sm">{item.category.icon}</span>
                          <span>{item.category.name}</span>
                        </div>
                        <h3 className="text-base font-bold text-earth-900 dark:text-earth-50 mb-4 line-clamp-2 leading-snug group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                          {item.title}
                        </h3>
                        
                        <div className="mt-auto space-y-2 pt-4 border-t border-earth-200/50 dark:border-earth-700/50">
                          <div className="flex items-center gap-2 text-xs text-earth-600 dark:text-earth-400 font-semibold">
                            <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-earth-600 dark:text-earth-400 font-semibold">
                            <Calendar className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            <span>{new Date(item.dateOccurred).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
            
            {/* Pagination Controls */}
            {data && data.pagination.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-center gap-4 mt-16"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                  disabled={(filters.page || 1) === 1}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/60 dark:bg-earth-900/40 border border-earth-200/50 dark:border-earth-700/50 text-earth-700 dark:text-earth-300 hover:bg-white dark:hover:bg-earth-800 transition-colors disabled:opacity-40 shadow-sm"
                >
                  Previous
                </motion.button>
                <div className="px-4 py-2 rounded-xl bg-white/60 dark:bg-earth-900/40 border border-earth-200/50 dark:border-earth-700/50 shadow-sm text-sm font-bold text-earth-700 dark:text-earth-300">
                  <span className="text-gold-600 dark:text-gold-400">{filters.page}</span> / {data.pagination.totalPages}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange('page', Math.min(data.pagination.totalPages, (filters.page || 1) + 1))}
                  disabled={(filters.page || 1) === data.pagination.totalPages}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/60 dark:bg-earth-900/40 border border-earth-200/50 dark:border-earth-700/50 text-earth-700 dark:text-earth-300 hover:bg-white dark:hover:bg-earth-800 transition-colors disabled:opacity-40 shadow-sm"
                >
                  Next
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
