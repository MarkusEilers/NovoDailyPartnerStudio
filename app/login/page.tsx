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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login fehlgeschlagen. Bitte versuche es erneut.');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-10">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#6e0147' }}>
              <span className="text-white font-bold text-xl">ND</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              NOVODAILY PARTNER STUDIO
            </h1>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Aging is Optional
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition"
                style={{ accentColor: '#6e0147' }}
                placeholder="deine@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition"
                style={{ accentColor: '#6e0147' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg font-medium text-white transition duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#6e0147',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#520038')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6e0147')}
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Noch kein Account?{' '}
              <Link
                href="/register"
                className="font-medium transition-colors"
                style={{ color: '#6e0147' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#520038')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6e0147')}
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
