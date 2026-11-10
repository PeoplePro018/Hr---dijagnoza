import React, { useState, useEffect } from 'react';
import { googleSignIn, logoutGoogle, isGmailConnected, initAuth, getCurrentUser } from '../lib/googleAuth';
import { CheckCircle2, LogOut, Mail, Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, compact = false }) => {
  const [isConnected, setIsConnected] = useState(isGmailConnected());
  const [userEmail, setUserEmail] = useState<string | null>(getCurrentUser()?.email || null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsConnected(true);
        setUserEmail(user.email);
      },
      () => {
        setIsConnected(false);
        setUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setIsConnected(true);
        setUserEmail(result.user.email);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setErrorMsg(err.message || 'Neuspešno povezivanje sa Google nalogom.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setIsConnected(false);
      setUserEmail(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isConnected) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate max-w-[160px] sm:max-w-[220px]">
          Google (Kalendar & Gmail): <strong>{userEmail || 'Povezan'}</strong>
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          title="Odjavi Google nalog"
          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        <span>{compact ? 'Poveži Kalendar' : 'Poveži Google (Kalendar & Gmail)'}</span>
      </button>

      {errorMsg && (
        <span className="text-[10px] text-red-600 block">{errorMsg}</span>
      )}
    </div>
  );
};
