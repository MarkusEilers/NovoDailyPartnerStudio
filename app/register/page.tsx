'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    partnerId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Registrierung fehlgeschlagen.');
        return;
      }

      setSuccessMessage(true);
      setFormData({ partnerId: '', firstName: '', lastName: '', email: '', password: '' });
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding panel with gradient */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #9A1866 0%, #6e0147 50%, #520D35 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <path d="M30 0L60 15V37L30 52L0 37V15Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)"/>
          </svg>
        </div>

        <div className="relative z-10 text-center px-16 max-w-lg">
          <div className="mb-6">
            <span className="text-5xl font-extrabold text-white tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>novo</span>
            <span className="text-5xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>DAILY</span>
          </div>
          <div className="w-12 h-px mx-auto mb-6 bg-white/30" />
          <p className="text-white/70 text-lg font-light tracking-wide">
            Partner Studio
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-0 mb-2">
              <span className="text-3xl font-extrabold tracking-wide" style={{ color: '#6e0147', fontFamily: 'Montserrat, sans-serif' }}>novo</span>
              <span className="text-3xl font-extralight tracking-wide" style={{ color: '#6e0147', fontFamily: 'Montserrat, sans-serif' }}>DAILY</span>
            </div>
            <p className="text-sm text-gray-400 font-light tracking-wide">Partner Studio</p>
          </div>

          {successMessage ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account erstellt!</h2>
              <p className="text-gray-500 mb-8">
                Ein Admin wird deinen Account in Kürze freischalten.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 py-3 px-8 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #9A1866 0%, #6e0147 100%)' }}
              >
                Zur Anmeldung
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Account erstellen</h2>
                <p className="text-gray-500 mb-8">Registriere dich als NovoDaily Partner.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="partnerId" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Partner-ID
                  </label>
                  <input
                    id="partnerId"
                    type="text"
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleChange}
                    required
                    pattern="NP[A-Z]{2}[0-9]{4}"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#6e0147] focus:ring-2 focus:ring-[#6e0147]/10 focus:outline-none transition font-mono"
                    placeholder="NPAB1234"
                  />
                  <p className="text-xs text-gray-400 mt-1">Format: NP + 2 Buchstaben + 4 Ziffern</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Vorname
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#6e0147] focus:ring-2 focus:ring-[#6e0147]/10 focus:outline-none transition"
                      placeholder="Max"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nachname
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#6e0147] focus:ring-2 focus:ring-[#6e0147]/10 focus:outline-none transition"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    E-Mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#6e0147] focus:ring-2 focus:ring-[#6e0147]/10 focus:outline-none transition"
                    placeholder="Mind. 6 Zeichen"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  style={{ background: 'linear-gradient(135deg, #9A1866 0%, #6e0147 100%)' }}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Wird registriert...
                    </span>
                  ) : 'Registrieren'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  Bereits registriert?{' '}
                  <Link href="/login" className="font-semibold text-[#6e0147] hover:text-[#520D35] transition-colors">
                    Jetzt anmelden
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
