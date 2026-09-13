import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Camera, Trash2, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { categoryApi } from '../../api/categoryApi';
import { itemApi, type UpdateItemInput } from '../../api/itemApi';
import { uploadImage } from '../../lib/upload';
import CustomDropdown from '../../components/ui/CustomDropdown';
import BackButton from '../../components/ui/BackButton';

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: item, isLoading: itemLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemApi.getItemById(id!),
    enabled: !!id,
  });

  const { isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  // ── Form State ──────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [dateOccurred, setDateOccurred] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'PENDING_REVIEW' | 'RESOLVED' | 'ARCHIVED'>('ACTIVE');

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // ── UI State ────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateItemInput) => itemApi.updateItem(id!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate(`/items/${id}`);
    },
    onError: (err: any) => {
      setError(err?.error?.message || err.message || 'An error occurred');
    }
  });

  // Populate state when item loads
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setColor(item.color || '');
      setBrand(item.brand || '');
      setLocation(item.location);
      if (item.dateOccurred) {
        const date = new Date(item.dateOccurred);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setDateOccurred(date.toISOString().slice(0, 16));
      }
      setStatus(item.status);
      setExistingImages(item.imageUrls || []);
    }
  }, [item]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (existingImages.length + newFiles.length + selectedFiles.length > 5) {
        setError('Maximum 5 images allowed total.');
        return;
      }
      setNewFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !location || !dateOccurred) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newImageUrls: string[] = [];
      for (const file of newFiles) {
        const url = await uploadImage(file);
        newImageUrls.push(url);
      }

      const finalImageUrls = [...existingImages, ...newImageUrls];

      let validDateIso = undefined;
      if (dateOccurred) {
        const parsedDate = new Date(dateOccurred);
        if (!isNaN(parsedDate.getTime())) {
          validDateIso = parsedDate.toISOString();
        } else {
          setError('Please provide a valid date.');
          setIsSubmitting(false);
          return;
        }
      }

      const input: UpdateItemInput = {
        title,
        description,
        color: color || null,
        brand: brand || null,
        location,
        status,
        ...(validDateIso && { dateOccurred: validDateIso }),
        imageUrls: finalImageUrls,
      };

      updateMutation.mutate(input, {
        onSettled: () => setIsSubmitting(false)
      });
    } catch (err: any) {
      setError(err?.error?.message || err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  if (itemLoading || categoriesLoading) {
    return (
      <div className="relative p-8 flex items-center justify-center min-h-[50vh]">
        <span className="w-10 h-10 border-3 border-earth-200 dark:border-white/10 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="relative p-8 flex items-center justify-center min-h-[50vh] text-earth-800 dark:text-earth-200 font-bold">
        Item not found
      </div>
    );
  }

  if (user?.id !== item.reporter?.id && user?.role !== 'ADMIN') {
    return <Navigate to={`/items/${id}`} replace />;
  }

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10">
      <div className="max-w-3xl mx-auto animate-fade-up">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="gold-accent" />
          <span className="caption-text text-gold-600 dark:text-gold-400 font-bold">Modify Report</span>
        </div>
        <h1 className="heading-1 mb-2">Edit Listing</h1>
        <p className="body-text mb-8 text-sm sm:text-base font-medium">Update details and status of this report.</p>

        <form onSubmit={handleSubmit} className="space-y-8 card-feature p-6 sm:p-10 shadow-2xl">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3 animate-shake">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-6">
              <h2 className="caption-text text-gold-600 dark:text-gold-400 font-extrabold pb-2 border-b border-earth-200/80 dark:border-white/[0.06]">
                General Information
              </h2>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">
                  Listing Status <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  value={status}
                  onChange={(value) => setStatus(value as any)}
                  options={[
                    { value: 'ACTIVE', label: 'Active (Unresolved / In Search)' },
                    { value: 'RESOLVED', label: 'Resolved (Reunited / Completed)' },
                    { value: 'ARCHIVED', label: 'Archived (Closed)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field resize-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1.5 uppercase tracking-wider">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            {/* Images */}
            <div className="md:col-span-2 mt-2 space-y-4">
              <h2 className="caption-text text-gold-600 dark:text-gold-400 font-extrabold pb-2 border-b border-earth-200/80 dark:border-white/[0.06]">
                Photos (Max 5)
              </h2>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, idx) => (
                  <div key={`exist-${idx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-earth-200/80 dark:border-white/10 group shadow-sm">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <div
                      onClick={() => removeExistingImage(idx)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                ))}

                {newFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-earth-200/80 dark:border-white/10 group shadow-sm">
                    <img src={URL.createObjectURL(file)} alt="New Preview" className="w-full h-full object-cover" />
                    <div
                      onClick={() => removeNewFile(idx)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                ))}

                {existingImages.length + newFiles.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-earth-300 dark:border-white/15 flex flex-col items-center justify-center text-earth-500 dark:text-earth-400 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/5 transition-all cursor-pointer"
                  >
                    <Camera className="w-6 h-6 mb-1 text-gold-500" />
                    <span className="text-[11px] font-bold">Add Photo</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-earth-200/80 dark:border-white/[0.06] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary text-xs px-5 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs px-7 py-3 font-bold shadow-lg shadow-gold-500/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
