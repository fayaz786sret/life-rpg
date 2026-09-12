import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ────────────────────────────────────────── */
// Returns seconds from "you can only request this after 53 seconds" OR "rate limit" messages
const getRateLimitSeconds = (msg = '') => {
  const m = msg.match(/after\s+(\d+)\s+second/i);
  if (m) return parseInt(m[1], 10);
  if (/rate.?limit|too many requests/i.test(msg)) return 60;
  return null;
};

// OAuth has been removed — helper removed to avoid unused URL parsing.

const friendlyError = (msg = '') => {
  if (/invalid.?login.?credentials/i.test(msg))    return 'Wrong email or password.';
  if (/email.?not.?confirmed/i.test(msg))           return 'Check your inbox and confirm your email first.';
  if (/user.?already.?registered/i.test(msg))       return 'Account already exists — sign in instead.';
  if (/password.?should.?be.?at.?least/i.test(msg)) return 'Password must be at least 6 characters.';
  if (/database error saving new user/i.test(msg))  return 'Sign-up reached Supabase Auth, but profile save failed. Apply the latest schema.sql and try again.';
  if (/unexpected_failure|failed to fetch|network/i.test(msg)) return 'Network/Supabase connection issue. Please try again.';
  if (/provider.?not.?enabled/i.test(msg))          return 'This OAuth provider isn\'t enabled in Supabase yet. Use email/password or Demo mode.';
  if (/oauth.?error|access_denied/i.test(msg))      return 'OAuth sign-in was cancelled or failed. Try again.';
  return msg;
};

/* ─── component ──────────────────────────────────────── */
export const LoginPage = () => {
  const [isSignUp,     setIsSignUp]     = useState(false);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [username,     setUsername]     = useState('');
  const [error,        setError]        = useState('');
  const [info,         setInfo]         = useState('');
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const [cooldown,     setCooldown]     = useState(0);
  const timerRef = useRef(null);

  const { signIn, signUp, signInAsDemoUser } = useAuth();

  // OAuth removed: no redirect error handling required here.

  // Countdown timer for rate-limit cooldown
  useEffect(() => {
    if (cooldown <= 0) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCooldown(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  /* ── Demo Quick-Play ────────────────────────────── */
  const handleDemo = () => {
    signInAsDemoUser();
  };

  /* ── Email / password ────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    if (!normalizedEmail) { setError('Email is required.'); return; }
    if (!password) { setError('Password is required.'); return; }
    if (isSignUp && !normalizedUsername) { setError('Hero name is required for sign-up.'); return; }

    setError(''); setInfo(''); setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: err } = await signUp(normalizedEmail, password, normalizedUsername);
        if (err) {
          const secs = getRateLimitSeconds(err.message);
          if (secs) { setCooldown(secs); setError(`Too many attempts — wait ${secs}s and try again.`); }
          else setError(friendlyError(err.message));
        } else if (data?.user && !data.session) {
          setInfo('✅ Account created! Check your inbox, confirm your email, then sign in.');
          setIsSignUp(false);
        }
        // If session exists immediately (email confirm disabled), auth state change fires automatically
      } else {
        const { error: err } = await signIn(normalizedEmail, password);
        if (err) {
          const secs = getRateLimitSeconds(err.message);
          if (secs) { setCooldown(secs); setError(`Too many attempts — wait ${secs}s and try again.`); }
          else setError(friendlyError(err.message));
        }
      }
    } catch (err) {
      setError(friendlyError(err?.message || 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  /* OAuth removed */

  const isSubmitDisabled = loading || cooldown > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: '#f7a017' }} />
          </motion.div>
          <h1 className="text-3xl md:text-4xl mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Life RPG
          </h1>
          <p style={{ color: '#9ca3af' }}>Level up your life, one quest at a time</p>
        </div>

        {/* ── Instant Demo button ─────────────────── */}
        <motion.button
          type="button"
          onClick={handleDemo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full mb-4 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
            border: '1px solid rgba(167,139,250,0.4)',
          }}
          aria-label="Play instantly as a demo hero — no account needed"
        >
          <Zap className="w-4 h-4" />
          ⚡ Instant Demo Play (No Sign-up Needed)
        </motion.button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: '#363654' }} />
          <span className="text-xs" style={{ color: '#6b7280' }}>or sign in with an account</span>
          <div className="flex-1 h-px" style={{ background: '#363654' }} />
        </div>

        {/* Card */}
        <motion.div className="card" layout>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>
              {isSignUp ? 'Create Character' : 'Continue Adventure'}
            </h2>

            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
                  <User className="w-4 h-4 inline mr-1" /> Hero Name
                </label>
                <input
                  id="username" type="text" value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field" placeholder="Enter your hero name"
                  required autoComplete="username"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </label>
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="hero@example.com"
                required autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
                <Lock className="w-4 h-4 inline mr-1" /> Password
              </label>
              <input
                id="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field" placeholder="••••••••"
                required minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-lg text-sm space-y-2" role="alert"
                  style={{ background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}
                >
                  <p>{error}</p>
                  {cooldown > 0 && (
                    <p style={{ color: '#fbbf24', fontSize: '0.75rem' }}>
                      💡 Tip: Use <strong>⚡ Instant Demo Play</strong> above to test the app right now — no signup needed!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info / success */}
            <AnimatePresence>
              {info && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-lg text-sm" role="status"
                  style={{ background: 'rgba(6,78,59,0.4)', border: '1px solid rgba(34,197,94,0.5)', color: '#86efac' }}
                >
                  {info}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button type="submit" disabled={isSubmitDisabled} className="btn-primary w-full">
              {loading
                ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚔️</motion.span>
                : cooldown > 0
                  ? `⏳ Try again in ${cooldown}s`
                  : isSignUp ? '⚔️ Begin Adventure' : '🚪 Enter Realm'}
            </button>

            {/* Cooldown progress bar */}
            <AnimatePresence>
              {cooldown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: '4px', background: '#2a2a3e' }}
                >
                  <motion.div
                    style={{ height: '100%', background: '#f7a017', originX: 0 }}
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: cooldown, ease: 'linear' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* OAuth removed: sign-in is email/password or demo only */}

          {/* Toggle sign-up / sign-in */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setInfo(''); setCooldown(0); }}
              className="text-sm transition-colors"
              style={{ color: '#f7a017' }}
              onMouseOver={e => e.currentTarget.style.color = '#f9b851'}
              onMouseOut={e  => e.currentTarget.style.color = '#f7a017'}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-xs mt-8" style={{ color: '#4b5563' }}>
          Transform your daily tasks into epic quests
        </p>
      </motion.div>
    </div>
  );
};
