import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";

export default function LoginPage() {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const usernameValid = username.trim().length >= 3;
  const passwordValid = password.length >= 6;
  const fullNameValid = mode === "register" ? fullName.trim().length >= 3 : true;
  const canSubmit = usernameValid && passwordValid && fullNameValid && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!usernameValid || !passwordValid || !fullNameValid) return;
    setLoading(true);
    try {
      let token, user;
      if (mode === "login") {
        ({ token, user } = await login(username.trim(), password));
      } else {
        ({ token, user } = await register(username.trim(), password, fullName.trim()));
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      try { sessionStorage.setItem('showGuideOnce', '1'); } catch {}
      navigate("/chat"); // Go to chatbot page
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/60 dark:border-gray-700"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        {mode === 'register' && (
          <input
            className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            minLength={3}
            required
          />
        )}
        <input
          className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          minLength={3}
          required
        />
        <input
          className="w-full mb-5 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && (
          <div className="text-red-600 dark:text-red-400 mb-3 text-center text-sm font-medium">{error}</div>
        )}
        <button
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 active:brightness-95 transition disabled:opacity-60"
          disabled={!canSubmit}
        >
          {loading ? 'Processing…' : mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-indigo-700 dark:text-indigo-300 hover:underline font-semibold"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create account' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
