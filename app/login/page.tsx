'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Login fehlgeschlagen.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#6e0147' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#E8A838' }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ backgroundColor: '#E8A838' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-5 border-2 border-white" />

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-white tracking-wider">NOVO</span>
            <span className="text-5xl font-light text-white tracking-wider">DAILY</span>
          </div>
          <div className="w-16 h-0.5 mx-auto mb-6" style={{ backgroundColor: '#E8A838' }} />
          <p className="text-white/80 text-xl font-light tracking-wide mb-3">
            Partner Studio
          </p>
          <p className="text-white/50 text-sm tracking-widest uppercase">
            Aging is Optional
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-1 mb-2">
              <span className="text-3xl font-extrabold tracking-wider" style={{ color: '#6e0147' }}>NOVO</span>
              <span className="text-3xl font-light tracking-wider" style={{ color: '#6e0147' }}>DAILY</span>
            </div>
            <p className="text-sm tracking-widest uppercase text-gray-400">Partner Studio</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Willkommen zurück</h2>
            <p className="text-gray-500 mb-8">Melde dich an, um fortzufahren.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#6e0147] focus:ring-2 focus:ring-[#6e0147]/10 focus:outline-none transition"
                placeholder="deine@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#6e0147] focus:ring-2 focus:ring-[#6e0147]/10 focus:outline-none transition"
                placeholder="Dein Passwort"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#6e0147]/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
              style={{ backgroundColor: '#6e0147' }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Wird angemeldet...
                </span>
              ) : 'Anmelden'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Noch kein Account?{' '}
              <Link href="/register" className="font-semibold text-[#6e0147] hover:text-[#520038] transition-colors">
                Jetzt registrieren
              </Link>
            </p>
          </div>

          {/* Bottom accent */}
          <div className="mt-12 flex items-center justify-center gap-2 opacity-30">
            <div className="w-8 h-0.5" style={{ backgroundColor: '#6e0147' }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E8A838' }} />
            <div className="w-8 h-0.5" style={{ backgroundColor: '#6e0147' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
