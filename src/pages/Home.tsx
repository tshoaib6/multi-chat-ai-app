import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(120%_120%_at_50%_0%,#e0f2fe_0,#d1fae5_30%,#f0fdf4_60%,#ffffff_100%)] dark:bg-[radial-gradient(120%_120%_at_50%_0%,#0f172a_0,#0b1220_45%,#070b14_100%)] text-slate-900 dark:text-slate-100">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/40 bg-white/70 dark:bg-slate-900/50 border-b border-white/40 dark:border-white/10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 grid place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow">
              <span className="text-xl">🧘‍♂️</span>
            </div>
            <span className="font-semibold tracking-tight">Multi-Chat AI Therapist</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm hover:text-teal-600 dark:hover:text-teal-300" href="#features">
              Features
            </a>
            <a className="text-sm hover:text-teal-600 dark:hover:text-teal-300" href="#how-it-works">
              How it works
            </a>
            <a className="text-sm hover:text-teal-600 dark:hover:text-teal-300" href="#faq">
              FAQ
            </a>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow hover:from-teal-600 hover:to-blue-600 transition"
            >
              Get started
            </button>
          </div>

          {/* Mobile menu button (simple jump to CTA) */}
          <button
            onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200/70 dark:border-white/10"
            aria-label="Open"
          >
            ☰
          </button>
        </nav>
      </header>

      {/* HERO / BANNER */}
      <section className="relative overflow-hidden">
        {/* soft blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-teal-400/25 blur-3xl dark:bg-teal-500/10" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl dark:bg-blue-500/10" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Join therapist-style debates with{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  multiple AIs
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Observe three expert personas discuss wellbeing topics—or jump in as the fourth voice.
                Save sessions, create private rooms, and learn through engaging, realistic dialogue.
              </p>

              <div id="cta" className="mt-6 flex flex-col xs:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full xs:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:from-teal-600 hover:to-blue-600 transition"
                >
                  Start now
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                  className="w-full xs:w-auto px-5 py-3 rounded-xl border border-slate-200/70 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition"
                >
                  Learn more
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-3">
                  {["🧠", "💬", "🫶", "🌿"].map((e, i) => (
                    <span
                      key={i}
                      className="inline-grid place-items-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-white dark:bg-slate-800 shadow"
                      title="user"
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <span>Trusted by early users for calm, thoughtful chats</span>
              </div>
            </div>

            {/* Center Image / Illustration */}
            <div className="relative mx-auto max-w-lg w-full">
              <div className="aspect-[4/3] rounded-3xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-2xl backdrop-blur overflow-hidden">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Why you’ll love it</h2>
        <p className="mt-2 text-center text-slate-600 dark:text-slate-300">
          Designed for clarity, compassion, and curiosity—on every device.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="🧑‍⚕️"
            title="3 expert personas"
            desc="Cognitive, holistic, and psychodynamic styles that debate respectfully."
          />
          <FeatureCard
            icon="💭"
            title="Join the roundtable"
            desc="Jump in as the fourth participant or watch quietly and learn."
          />
          <FeatureCard
            icon="🔒"
            title="Private or public"
            desc="Start private rooms, invite friends, or browse public debates."
          />
          <FeatureCard
            icon="💾"
            title="Save & export"
            desc="Bookmark sessions, export transcripts, and revisit insights anytime."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-10 shadow-xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["Pick a topic", "Choose from curated wellbeing prompts or start your own."],
              ["Meet the AIs", "Three distinct therapists begin a thoughtful discussion."],
              ["Jump in", "Add your perspective or guide the debate with your questions."],
            ].map(([title, desc], i) => (
              <div key={i} className="p-4">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="faq" className="mt-auto border-t border-white/40 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Multi-Chat AI Therapist</p>
          <div className="flex items-center gap-6">
            <a className="hover:text-teal-600 dark:hover:text-teal-300" href="#features">
              Features
            </a>
            <a className="hover:text-teal-600 dark:hover:text-teal-300" href="#how-it-works">
              How it works
            </a>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow hover:from-teal-600 hover:to-blue-600 transition"
            >
              Login / Get started
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Small building blocks ---------- */

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl p-5 border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur shadow hover:shadow-lg transition">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow mb-3">
        <span className="text-lg">{icon}</span>
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}

/** Center banner illustration (inline SVG, scales perfectly) */
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="h-full w-full"
      role="img"
      aria-label="People chatting with AI bubbles"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* background shapes */}
      <circle cx="120" cy="90" r="70" fill="url(#g1)" opacity="0.25" filter="url(#blur)" />
      <circle cx="720" cy="520" r="90" fill="url(#g1)" opacity="0.2" filter="url(#blur)" />

      {/* device frame */}
      <rect x="140" y="90" rx="26" ry="26" width="520" height="420" fill="#ffffff" opacity="0.85" />
      <rect x="140" y="90" rx="26" ry="26" width="520" height="420" fill="none" stroke="#e5e7eb" />

      {/* header bar */}
      <rect x="140" y="90" width="520" height="56" fill="#f8fafc" />
      <rect x="140" y="90" width="520" height="56" fill="none" stroke="#e5e7eb" />
      <circle cx="172" cy="118" r="10" fill="#14b8a6" />
      <rect x="194" y="110" width="160" height="16" rx="8" fill="#cbd5e1" />

      {/* chat bubbles */}
      <g transform="translate(170,180)">
        <rect width="260" height="56" rx="14" fill="#e2f7f3" />
        <rect x="12" y="16" width="200" height="12" rx="6" fill="#0f766e" opacity="0.7" />
        <rect x="12" y="34" width="150" height="12" rx="6" fill="#0f766e" opacity="0.5" />
      </g>

      <g transform="translate(370,260)">
        <rect width="260" height="56" rx="14" fill="#eef2ff" />
        <rect x="12" y="16" width="180" height="12" rx="6" fill="#3730a3" opacity="0.7" />
        <rect x="12" y="34" width="130" height="12" rx="6" fill="#3730a3" opacity="0.5" />
      </g>

      <g transform="translate(170,340)">
        <rect width="220" height="56" rx="14" fill="#fff7ed" />
        <rect x="12" y="16" width="160" height="12" rx="6" fill="#9a3412" opacity="0.7" />
        <rect x="12" y="34" width="120" height="12" rx="6" fill="#9a3412" opacity="0.5" />
      </g>

      {/* typing bar */}
      <rect x="168" y="442" width="464" height="40" rx="10" fill="#f1f5f9" />
      <rect x="180" y="452" width="250" height="20" rx="10" fill="#cbd5e1" />
      <rect x="446" y="452" width="70" height="20" rx="10" fill="url(#g1)" opacity="0.8" />
    </svg>
  );
}
