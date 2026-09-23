import React, { useState } from 'react';
import { Lock, KeyRound, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onBackToSite,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter the administrator access key.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      apiClient.setAdminToken(tokenInput.trim());
      // Test the credentials against the admin dashboard endpoint
      await apiClient.getAdminDashboard();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials. Please verify your access key.');
      apiClient.setAdminToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDevKey = () => {
    setTokenInput('goodluck-admin-secret-key-change-in-production');
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111317] border border-[#222630] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* Back Link */}
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs text-[#8c92a0] hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Salon Website</span>
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center mx-auto mb-3 text-[#c5a880]">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif text-white tracking-tight">Salon Management</h1>
          <p className="text-xs text-[#9ea3ae] mt-1">
            Sign in to view today’s schedule, manage services, and configure operating hours.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#b5b1a9] mb-1.5">
              Admin Access Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727885]" />
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter secret administrator key..."
                className="w-full bg-[#181a20] border border-[#262a34] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#5c6170] focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#c5a880] hover:bg-[#d8be98] text-black font-semibold text-xs tracking-wide uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Enter</span>
              </>
            )}
          </button>
        </form>

        {/* Development Helper Badge */}
        <div className="mt-6 pt-5 border-t border-[#1f232d] text-center">
          <p className="text-[11px] text-[#696f7d] mb-2">
            Development Mode Default Key:
          </p>
          <button
            type="button"
            onClick={handleUseDevKey}
            className="text-xs font-mono text-[#c5a880] hover:underline cursor-pointer bg-[#171920] px-3 py-1.5 rounded-lg border border-[#252834]"
          >
            Auto-fill Dev Key
          </button>
        </div>
      </div>
    </div>
  );
};
