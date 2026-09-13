import { FileText, CheckCircle2 } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <FileText className="w-6 h-6 text-indigo-500" />
        </div>
        <h1 className="heading-1 text-earth-900 dark:text-white">Terms of Service</h1>
      </div>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-earth-600 dark:text-earth-400">
        <p className="lead text-lg font-medium text-earth-800 dark:text-earth-200 mb-8">
          By using Trace, you agree to these terms. Please read them carefully. Our goal is to maintain a safe, honest, and helpful network for all users.
        </p>

        <h2 className="text-xl font-bold text-earth-900 dark:text-white mb-4">1. User Conduct</h2>
        <ul className="space-y-2 mb-8 list-none pl-0">
          {[
            'You must use a valid email address to register.',
            'You may not file false claims for items that do not belong to you.',
            'You must treat all members with respect in the Secure Chat.',
            'Administrators reserve the right to ban users who violate these rules.'
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-bold text-earth-900 dark:text-white mb-4">2. Claims & Disputes</h2>
        <p className="mb-6">
          The Trace platform facilitates the matching of lost and found items. We do not guarantee the recovery of any item, nor do we take responsibility for disputes arising from false claims. All ownership verification is handled between the finder and the claimant via the platform's verification questions.
        </p>

        <h2 className="text-xl font-bold text-earth-900 dark:text-white mb-4">3. Limitation of Liability</h2>
        <p className="mb-6">
          Trace is provided "as is". We shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
        </p>

        <p className="text-sm italic mt-12">Last updated: August 29, 2026</p>
      </div>
    </div>
  );
}
