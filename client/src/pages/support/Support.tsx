import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, ShieldCheck, Bug, AlertTriangle, Lightbulb, Sparkles, Upload, X } from 'lucide-react';
import { feedbackApi } from '../../api/feedbackApi';

const formVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

type FeedbackType = 'BUG' | 'PROBLEM' | 'FEEDBACK' | 'FEATURE_REQUEST';
type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export default function Support() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const prefilledItemId = searchParams.get('itemId') || '';
  
  const [type, setType] = useState<FeedbackType>(prefilledItemId ? 'PROBLEM' : 'FEEDBACK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityType>('LOW');
  
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const types = [
    { id: 'BUG', label: 'Report a Bug', icon: Bug, desc: 'Something is broken' },
    { id: 'PROBLEM', label: 'Report Problem', icon: AlertTriangle, desc: 'Issue with a listing' },
    { id: 'FEEDBACK', label: 'Give Feedback', icon: Lightbulb, desc: 'General thoughts' },
    { id: 'FEATURE_REQUEST', label: 'Suggest Feature', icon: Sparkles, desc: 'New ideas' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be less than 5MB');
        return;
      }
      setScreenshotFile(file);
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await feedbackApi.uploadScreenshot(screenshotFile);
      }

      const res = await feedbackApi.createFeedback({
        type,
        title,
        description,
        severity: type === 'BUG' ? severity : undefined,
        screenshotUrl: screenshotUrl || undefined,
        pageUrl: window.location.href,
        route: location.pathname,
        itemId: type === 'PROBLEM' ? prefilledItemId : undefined,
      });

      setReportId(res.data.feedback.id);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-earth-50 dark:bg-earth-950 overflow-hidden">
      <div className="premium-bg" />
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-earth-900/40 backdrop-blur-3xl backdrop-saturate-150">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex lg:w-[40%] relative flex-col justify-end p-12 overflow-hidden border-r border-white/20 dark:border-white/5 bg-earth-900/5 dark:bg-earth-900/30">
          <div className="relative z-10 space-y-6 p-8 rounded-[2rem] bg-white/50 dark:bg-earth-900/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl">
            <Link to="/" className="inline-flex items-center gap-4 group mb-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <span className="text-3xl font-black text-white tracking-tight leading-none">Trace</span>
            </Link>
            <h1 className="text-3xl font-bold text-white leading-tight">Help & Feedback</h1>
            <p className="text-earth-300 font-medium">Your input helps us improve the platform for everyone.</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[60%] p-6 sm:p-10 lg:p-12 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
          <motion.div variants={formVariants} initial="hidden" animate="visible" className="w-full max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3"
                >
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-center flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">Thanks for helping us improve!</h3>
                  <p className="text-sm font-medium">Your report has been submitted successfully.</p>
                  {reportId && <p className="text-xs font-mono opacity-70">Reference: {reportId}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {!success && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-3">What would you like to do?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as FeedbackType)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                          type === t.id
                            ? 'bg-gold-500/10 border-gold-500 shadow-sm text-earth-900 dark:text-white'
                            : 'bg-white/60 dark:bg-earth-900/40 border-earth-200/60 dark:border-earth-700/50 text-earth-600 dark:text-earth-400 hover:border-gold-500/50'
                        }`}
                      >
                        <t.icon className={`w-6 h-6 mb-2 ${type === t.id ? 'text-gold-500' : ''}`} />
                        <span className="font-bold text-sm">{t.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>



                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field py-3 text-sm bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 rounded-xl"
                    placeholder={type === 'BUG' ? "e.g. Map is not loading" : type === 'PROBLEM' ? "e.g. Fake listing" : "e.g. Dark mode is great"}
                  />
                </motion.div>

                {type === 'BUG' && (
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Severity</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'LOW', label: 'Low', desc: 'Minor issue' },
                        { id: 'MEDIUM', label: 'Medium', desc: 'Workaround exists' },
                        { id: 'HIGH', label: 'High', desc: 'Feature broken' },
                        { id: 'CRITICAL', label: 'Critical', desc: 'App crash' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSeverity(s.id as SeverityType)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            severity === s.id
                              ? 'bg-gold-500/10 border-gold-500 shadow-sm'
                              : 'bg-white/60 dark:bg-earth-900/40 border-earth-200/60 dark:border-earth-700/50 hover:border-gold-500/50'
                          }`}
                        >
                          <div className={`text-sm font-bold ${severity === s.id ? 'text-earth-900 dark:text-white' : 'text-earth-700 dark:text-earth-300'}`}>{s.label}</div>
                          <div className={`text-[10px] mt-0.5 ${severity === s.id ? 'text-earth-600 dark:text-earth-400' : 'text-earth-500 dark:text-earth-400 opacity-70'}`}>{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Details</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field py-3 text-sm bg-white/80 dark:bg-earth-950/60 backdrop-blur-md border-earth-200 dark:border-earth-800/80 focus:border-gold-500 rounded-xl resize-none"
                    placeholder="Please provide as much detail as possible..."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Screenshot (Optional)</label>
                  <div className="flex items-center gap-4">
                    {!screenshotPreview ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-earth-300 dark:border-earth-700 rounded-2xl bg-white/50 dark:bg-earth-900/20 hover:bg-white/80 transition-colors"
                      >
                        <Upload className="w-6 h-6 text-earth-400 mb-2" />
                        <span className="text-xs font-bold text-earth-600">Click to upload image</span>
                        <span className="text-[10px] text-earth-400">JPG, PNG up to 5MB</span>
                      </button>
                    ) : (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-earth-200 shadow-sm">
                        <img src={screenshotPreview} className="w-full h-full object-cover" alt="Preview" />
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 shadow-lg flex items-center justify-center gap-2 group mt-4 transition-all border border-white/10"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Submit Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </motion.button>
              </form>
            )}
            
            <motion.div variants={itemVariants} className="mt-6 text-center text-sm font-medium">
              <button onClick={() => navigate(-1)} className="font-bold text-earth-500 hover:text-gold-500 transition-colors">
                Cancel & Go Back
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
