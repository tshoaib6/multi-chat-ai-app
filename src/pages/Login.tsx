import { useState } from 'react';
import { login, register } from '../api';

export default function LoginPage({ onAuth }: { onAuth: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{username?: boolean; password?: boolean}>({});

  // Validation
  const usernameValid = username.length >= 3;
  const passwordValid = password.length >= 6;
  const canSubmit = usernameValid && passwordValid && !loading;

  async function handleSubmit(e: any) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!usernameValid || !passwordValid) return;
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'login' ? login : register;
      const { token, user } = await fn(username, password);
      onAuth(token, user);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-fadein">
      <form className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm mx-2 animate-fadein-slow relative" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center mb-6">
          <span className="inline-block text-5xl animate-bounce mb-2">🧘‍♂️</span>
          <h2 className="text-2xl font-bold mb-1 text-center text-teal-700 dark:text-teal-200 tracking-tight drop-shadow">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your Wellbeing AI Chat</p>
        </div>
        <div className="mb-3">
          <input
            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-400 outline-none transition ${touched.username && !usernameValid ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onBlur={() => setTouched(t => ({...t, username: true}))}
            minLength={3}
            required
            autoFocus
          />
          {touched.username && !usernameValid && <div className="text-xs text-red-500 mt-1">Username must be at least 3 characters</div>}
        </div>
        <div className="mb-3 relative">
          <div className="relative flex items-center">
            <input
              className={`w-full px-3 py-2 pr-10 rounded-lg border focus:ring-2 focus:ring-teal-400 outline-none transition ${touched.password && !passwordValid ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({...t, password: true}))}
              minLength={6}
              required
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={0}>
              {showPassword ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7s4-7 9-7c1.5 0 2.9.3 4.125.825M19.07 4.93A9.97 9.97 0 0 1 21 12c0 1.61-.38 3.13-1.07 4.44M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M1 1l22 22"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2.05 12C3.81 7.61 7.86 4.5 12 4.5c4.14 0 8.19 3.11 9.95 7.5-1.76 4.39-5.81 7.5-9.95 7.5-4.14 0-8.19-3.11-9.95-7.5z"/></svg>
              )}
            </button>
          </div>
          {touched.password && !passwordValid && <div className="text-xs text-red-500 mt-1">Password must be at least 6 characters</div>}
        </div>
        {error && <div className="text-red-500 mb-2 text-center animate-shake">{error}</div>}
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-400 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2" disabled={!canSubmit}>
          {loading ? <span className="animate-pulse">...</span> : mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="mt-6 text-center">
          <button type="button" className="text-teal-600 dark:text-teal-300 underline font-medium" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create account' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 0.7s cubic-bezier(.4,2,.6,1) both; }
        .animate-fadein-slow { animation: fadein 1.2s cubic-bezier(.4,2,.6,1) both; }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </div>
  );
}
