import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Master Admin Password for Dragana Stanimirović
const ADMIN_PASSWORD = 'peoplepro2025';

export function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem('peoplepro_admin_session', 'true');
      try {
        localStorage.removeItem('peoplepro_admin_auth');
        localStorage.removeItem('peoplepro_admin_auth_time');
      } catch (err) {}
      onSuccess();
      onClose();
    } else {
      setError('Pogrešna administratorska lozinka. Pokušajte ponovo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1a3d99] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Administratorski Pristup</h3>
              <p className="text-xs text-slate-300">People Pro HR Konsalting • CRM Baza</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#2761ff] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950 mb-0.5">Zaštićena zona za konsultanta</p>
              <p className="text-blue-800/90 leading-relaxed">
                Pristup bazi prijava, PIB podacima pravnih lica i CRM analitici dostupan je isključivo Dragani Stanimirović i ovlašćenim licima People Pro.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Administratorska lozinka
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Unesite lozinku..."
                autoFocus
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2761ff]/30 focus:border-[#2761ff] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>


          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#2761ff] hover:bg-[#1a4cd2] rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Prijavi se u Admin panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
