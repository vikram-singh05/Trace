import { Shield, Lock, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
          <Shield className="w-6 h-6 text-gold-500" />
        </div>
        <h1 className="heading-1 text-earth-900 dark:text-white">Privacy Policy</h1>
      </div>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-earth-600 dark:text-earth-400">
        <p className="lead text-lg font-medium text-earth-800 dark:text-earth-200 mb-8">
          At Trace, your privacy is our priority. We are committed to protecting the personal information of our users across all connected communities.
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-3xl bg-earth-100/50 dark:bg-earth-900/30 border border-earth-200/50 dark:border-earth-800/50">
            <Lock className="w-6 h-6 text-gold-500 mb-4" />
            <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-2">Data Security</h3>
            <p className="text-sm">We use enterprise-grade encryption for all sensitive data. Secure chats and verification questions are strictly confidential.</p>
          </div>
          <div className="p-6 rounded-3xl bg-earth-100/50 dark:bg-earth-900/30 border border-earth-200/50 dark:border-earth-800/50">
            <Eye className="w-6 h-6 text-gold-500 mb-4" />
            <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-2">Transparency</h3>
            <p className="text-sm">We only collect data necessary to reunite lost items with their owners. We do not sell your personal data to third parties.</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-earth-900 dark:text-white mb-4">1. Information We Collect</h2>
        <p className="mb-6">
          When you register for an account, we collect your email address and basic profile information. When reporting items, we collect location data, descriptions, and images. All communication within the Secure Chat is securely stored for moderation and safety purposes.
        </p>

        <h2 className="text-xl font-bold text-earth-900 dark:text-white mb-4">2. How We Use Your Information</h2>
        <p className="mb-6">
          Your information is used exclusively to operate the Trace platform, verify ownership claims, and notify you when a match is found. Administrators may review chat logs if a user is reported for abuse.
        </p>

        <p className="text-sm italic mt-12">Last updated: August 29, 2026</p>
      </div>
    </div>
  );
}
