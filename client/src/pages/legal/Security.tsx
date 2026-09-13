import { ShieldCheck, Server, Key } from 'lucide-react';

export default function Security() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>
        <h1 className="heading-1 text-earth-900 dark:text-white">Security Overview</h1>
      </div>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-earth-600 dark:text-earth-400">
        <p className="lead text-lg font-medium text-earth-800 dark:text-earth-200 mb-8">
          Trace is built with modern security practices to ensure your data, claims, and communications remain private and protected from unauthorized access.
        </p>

        <div className="space-y-8 mb-12">
          <div className="flex gap-4">
            <div className="mt-1">
              <Server className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-2">Infrastructure Security</h3>
              <p className="text-sm">Our platform is hosted on secure cloud infrastructure with strict firewall rules, continuous monitoring, and automated daily backups. We use industry-standard mitigation to prevent DDoS attacks and unauthorized intrusions.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1">
              <Key className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-2">Data Protection & Authentication</h3>
              <p className="text-sm">All passwords are hashed using bcrypt before being stored in our database. We use secure HTTP-only cookies to handle JSON Web Tokens (JWT) for authentication, protecting you from common XSS and CSRF attacks.</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-earth-900 dark:text-white mb-4">Vulnerability Disclosure</h2>
        <p className="mb-6">
          If you believe you have found a security vulnerability in Trace, please contact our administrative team immediately. We take all reports seriously and will work to patch any verified issues promptly.
        </p>

        <p className="text-sm italic mt-12">Last updated: August 29, 2026</p>
      </div>
    </div>
  );
}
