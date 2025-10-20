import { useState } from 'react';
import { login, register } from '../api';

export default function LoginPage({ onAuth }: { onAuth: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-center">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <input
          className="w-full mb-3 px-3 py-2 rounded border"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full mb-3 px-3 py-2 rounded border"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <button className="w-full py-2 rounded bg-gray-900 text-white font-semibold" disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="mt-4 text-center">
          <button type="button" className="text-blue-600 underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create account' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
