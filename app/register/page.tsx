'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    partnerId: '',
    vorname: '',
    nachname: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
        return;
      }

      setSuccessMessage(true);
      setFormData({
        partnerId: '',
        vorname: '',
        nachname: '',
        email: '',
        password: '',
      });
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

          {/* Success State */}
          {successMessage ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-4">
                  Dein Account wurde erstellt!
                </p>
                <p className="text-green-700 text-sm">
                  Ein Admin wird Dich in Kürze freischalten.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block py-2.5 px-6 rounded-lg font-medium text-white transition duration-200 transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#6e0147' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#520038')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6e0147')}
              >
                Zur Anmeldung
              </Link>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-1">
                    Partner-ID
                  </label>
                  <input
                    id="partnerId"
                    type="text"
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleChange}
                    required
                    pattern="[A-Z]{2,4}[0-9]{4,}"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition"
                    style={{ accentColor: '#6e0147' }}
                    placeholder="NPAB1234"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: z.B. NPAB1234</p>
                </div>

                <div>
                  <label htmlFor="vorname" className="block text-sm font-medium text-gray-700 mb-1">
                    Vorname
                  </label>
                  <input
                    id="vorname"
                    type="text"
                    name="vorname"
                    value={formData.vorname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition"
                    style={{ accentColor: '#6e0147' }}
                    placeholder="Max"
                  />
                </div>

                <div>
                  <label htmlFor="nachname" className="block text-sm font-medium text-gray-700 mb-1">
                    Nachname
                  </label>
                  <input
                    id="nachname"
                    type="text"
                    name="nachname"
                    value={formData.nachname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition"
                    style={{ accentColor: '#6e0147' }}
                    placeholder="Mustermann"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none transition"
                    style={{ accentColor: '#6e0147' }}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg font-medium text-white transition duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed mt-6"
                  style={{
                    backgroundColor: '#6e0147',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#520038')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6e0147')}
                >
                  {isLoading ? 'Wird registriert...' : 'Registrieren'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Bereits registriert?{' '}
                  <Link
                    href="/login"
                    className="font-medium transition-colors"
                    style={{ color: '#6e0147' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#520038')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6e0147')}
                  >
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
