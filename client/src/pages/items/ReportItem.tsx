import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, X, Plus, Trash2, Info, CheckCircle2, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import CustomDropdown from '../../components/ui/CustomDropdown';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';
import { itemApi } from '../../api/itemApi';
import type { CreateItemInput, VerificationQuestionInput } from '../../api/itemApi';
import { uploadImage } from '../../lib/upload';

export default function ReportItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as 'LOST' | 'FOUND') || 'LOST';
  const initialTitle = searchParams.get('title') || '';

  // ── Form State ──────────────────────────────────────────────────
  const [type, setType] = useState<'LOST' | 'FOUND'>(initialType);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [dateOccurred, setDateOccurred] = useState<Date | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<VerificationQuestionInput[]>([
    { question: '', displayOrder: 1 },
  ]);

  // ── UI State ────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdItemId, setCreatedItemId] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateItemInput) => itemApi.createItem(input),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setCreatedItemId(newItem.id);
      setShowSuccess(true);
    },
    onError: (err: any) => {
      setError(err?.error?.message || err.message || 'An error occurred while creating report');
    }
  });

  // ── Handlers ────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setError('Maximum 5 images allowed.');
        return;
      }
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    if (questions.length >= 3) return;
    setQuestions((prev) => [...prev, { question: '', displayOrder: prev.length + 1 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, displayOrder: i + 1 })));
  };

  const updateQuestion = (index: number, field: keyof VerificationQuestionInput, value: string) => {
    setQuestions((prev) => {
      const newQ = [...prev];
      newQ[index] = { ...newQ[index], [field]: value };
      return newQ;
    });
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && (!title || !categoryId)) {
      setError('Title and Category are required.');
      return;
    }
    if (step === 2 && (!location || !dateOccurred || !description)) {
      setError('Location, Date, and Description are required.');
      return;
    }
    if (step === 3 && files.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'FOUND' && questions.some((q) => !q.question.trim())) {
      setError('Please complete all verification questions for found items.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (files.length === 0) {
        setError('Please upload at least one image.');
        setIsSubmitting(false);
        return;
      }

      const imageUrls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }

      const input: CreateItemInput = {
        type, categoryId, title, description,
        color: color || null, brand: brand || null, location,
        dateOccurred: dateOccurred!.toISOString(), imageUrls,
        ...(type === 'FOUND' && { verificationQuestions: questions }),
      };

      createMutation.mutate(input, {
        onSettled: () => setIsSubmitting(false)
      });
    } catch (err: any) {
      setError(err?.error?.message || err.message || 'An error occurred while creating report');
      setIsSubmitting(false);
    }
  };

  const totalSteps = type === 'FOUND' ? 4 : 3;

  return (
    <div className="relative p-4 sm:p-8 pt-6 sm:pt-10 min-h-screen overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full filter blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      
      <div className="max-w-3xl mx-auto relative z-10 animate-fade-up">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse-glow" />
            <span className="caption-text font-bold text-amber-600 dark:text-amber-400">Listing Studio</span>
          </div>
          <h1 className="heading-1 text-cosmic-900 dark:text-white">Publish a Listing</h1>
          <p className="body-text mt-2 text-sm sm:text-base font-medium">Broadcast a lost or found report to your community.</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= i + 1 ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30' : 'bg-earth-200 dark:bg-earth-800 text-earth-500'
              }`}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-8 h-1 rounded-full ${step > i + 1 ? 'bg-gold-500' : 'bg-earth-200 dark:bg-earth-800'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card-feature p-6 sm:p-10 shadow-2xl relative min-h-[400px] flex flex-col justify-between">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3 mb-6 animate-shake">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Intent & Basic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-cosmic-900 dark:text-white border-b border-earth-200 dark:border-white/10 pb-2">1. The Basics</h2>
              
              <div>
                <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-4 uppercase tracking-widest">Listing Intent</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setType('LOST')} className={`p-5 rounded-2xl text-left border-2 transition-all ${type === 'LOST' ? 'bg-gold-500/10 border-gold-500 text-gold-700 dark:text-gold-400' : 'bg-white/50 dark:bg-cosmic-950/30 border-white/20 dark:border-white/10 hover:border-gold-500/50 text-cosmic-600 dark:text-cosmic-400'}`}>
                    <div className="text-base font-bold">I Lost Something</div>
                    <p className="text-xs mt-1 font-medium opacity-80">Post a description so finders can reach you</p>
                  </button>
                  <button type="button" onClick={() => setType('FOUND')} className={`p-5 rounded-2xl text-left border-2 transition-all ${type === 'FOUND' ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400' : 'bg-white/50 dark:bg-cosmic-950/30 border-white/20 dark:border-white/10 hover:border-amber-500/50 text-cosmic-600 dark:text-cosmic-400'}`}>
                    <div className="text-base font-bold">I Found Something</div>
                    <p className="text-xs mt-1 font-medium opacity-80">Safeguard an item and verify the rightful owner</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Listing Title <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Silver 14-inch MacBook Pro" className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                <CustomDropdown options={categories.map(cat => ({ value: cat.id, label: cat.name, icon: <span>{cat.icon}</span> }))} value={categoryId} onChange={setCategoryId} placeholder="Select a category" />
              </div>
            </div>
          )}

          {/* STEP 2: Context */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-cosmic-900 dark:text-white border-b border-earth-200 dark:border-white/10 pb-2">2. Context & Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Brand / Make (Optional)</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Apple, Sony" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Color (Optional)</label>
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Space Gray" className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Location <span className="text-red-500">*</span></label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Science Library" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Date & Time <span className="text-red-500">*</span></label>
                  <CustomDatePicker selected={dateOccurred} onChange={setDateOccurred} className="input-field w-full" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cosmic-700 dark:text-cosmic-300 mb-1.5">Full Description <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe key details..." rows={4} className="input-field resize-none" />
              </div>
            </div>
          )}

          {/* STEP 3: Media */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-cosmic-900 dark:text-white border-b border-earth-200 dark:border-white/10 pb-2 flex justify-between">
                <span>3. Photos</span>
                <span className="text-sm font-bold text-gold-500">{files.length} / 5</span>
              </h2>
              <div className="flex flex-wrap gap-4 mt-4">
                {files.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 group shadow-md">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6 text-red-400" /></button>
                  </div>
                ))}
                {files.length < 5 && (
                  <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-cosmic-300 flex flex-col items-center justify-center text-cosmic-500 hover:text-gold-500 hover:border-gold-500 transition-colors cursor-pointer">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Add Photo</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
              </div>
            </div>
          )}

          {/* STEP 4: Verification (FOUND Only) */}
          {step === 4 && type === 'FOUND' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-cosmic-900 dark:text-white border-b border-earth-200 dark:border-white/10 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> 4. Secret Questions
              </h2>
              <p className="text-sm text-cosmic-600 dark:text-cosmic-400 font-medium">Ask questions only the true owner can answer.</p>
              
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 liquid-glass border border-white/10 rounded-xl relative shadow-md">
                    {questions.length > 1 && <button type="button" onClick={() => removeQuestion(idx)} className="absolute top-4 right-4 text-cosmic-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    <label className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">Question #{idx + 1}</label>
                    <input type="text" value={q.question} onChange={(e) => updateQuestion(idx, 'question', e.target.value)} placeholder="e.g. What color is the lanyard?" className="input-field" />
                  </div>
                ))}
                {questions.length < 3 && (
                  <button type="button" onClick={addQuestion} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-amber-600 py-3 rounded-xl border-2 border-dashed border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/5"><Plus className="w-5 h-5" /> Add Another Question</button>
                )}
              </div>
            </div>
          )}

          {/* Wizard Footer */}
          <div className="pt-8 mt-auto flex items-center justify-between border-t border-earth-200 dark:border-white/10">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn-secondary px-6 py-3 shadow-md flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            
            {step < totalSteps ? (
              <button type="button" onClick={nextStep} className="btn-primary px-8 py-3 shadow-xl flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 shadow-xl flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Publish Listing
              </button>
            )}
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="liquid-glass w-full max-w-md p-10 text-center rounded-3xl animate-fade-up">
            <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><CheckCircle2 className="w-10 h-10" /></div>
            <h2 className="text-2xl font-bold mb-3 text-white">Listing Published!</h2>
            <p className="text-cosmic-300 mb-8 font-medium">Your report is live and being matched.</p>
            <button onClick={() => navigate(`/items/${createdItemId}`)} className="btn-primary w-full py-4 text-lg">View Published Listing</button>
          </div>
        </div>
      )}
    </div>
  );
}
