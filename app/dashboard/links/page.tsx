'use client'

import React, { useEffect, useState } from 'react'
import { usePartner } from '../layout'

interface Link {
  id: string
  partnerId: string
  type: 'masterclass' | 'shop' | 'product' | 'custom'
  label: string
  baseUrl: string
  clickCount: number
  createdAt: string
}

interface LinkWithFullUrl extends Link {
  fullUrl: string
}

const baseUrls = {
  masterclass: 'https://novomasterclass.vercel.app',
  shop: 'https://shop.novodaily.com',
  product: 'https://novodaily.com/product',
  custom: '',
}

const typeLabels = {
  masterclass: 'Masterclass',
  shop: 'Shop',
  product: 'Produkt',
  custom: 'Eigener Link',
}

const typeColors = {
  masterclass: '#6e0147',
  shop: '#E8A838',
  product: '#6e0147',
  custom: '#6b7280',
}

export default function LinksPage() {
  const partner = usePartner()
  const [links, setLinks] = useState<LinkWithFullUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'masterclass' as keyof typeof baseUrls,
    label: '',
    baseUrl: baseUrls.masterclass,
  })
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Fetch links on mount
  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/partners/links')
      if (!response.ok) {
        throw new Error('Failed to fetch links')
      }
      const data = await response.json()
      const linksWithUrls = data.links.map((link: Link) => {
        const urlObject = new URL(link.baseUrl)
        urlObject.searchParams.append('invite', partner.id)
        return {
          ...link,
          fullUrl: urlObject.toString(),
        }
      })
      setLinks(linksWithUrls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (newType: keyof typeof baseUrls) => {
    setFormData({
      ...formData,
      type: newType,
      baseUrl: newType === 'custom' ? '' : baseUrls[newType],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.label || !formData.baseUrl) {
      setError('Bitte füllen Sie alle Felder aus')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const response = await fetch('/api/partners/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          label: formData.label,
          baseUrl: formData.baseUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create link')
      }

      await fetchLinks()
      setFormData({
        type: 'masterclass',
        label: '',
        baseUrl: baseUrls.masterclass,
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Link löschen möchten?')) {
      return
    }

    try {
      const response = await fetch('/api/partners/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete link')
      }

      await fetchLinks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#6e0147' }}>
          Deine Links
        </h1>
        <p className="mt-2 text-gray-600">
          Erstelle personalisierte Links mit Deinem Partner-Code. Jeder Klick wird automatisch gezählt.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Link Button */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 text-white font-medium rounded-lg transition-colors"
          style={{ backgroundColor: '#6e0147' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#550038'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6e0147'
          }}
        >
          + Neuen Link erstellen
        </button>
      </div>

      {/* Create Link Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#6e0147' }}>
            Neuen Link erstellen
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link-Typ
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as keyof typeof baseUrls)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                style={{ accentColor: '#6e0147' }}
              >
                <option value="masterclass">Masterclass</option>
                <option value="shop">Shop</option>
                <option value="product">Produkt</option>
                <option value="custom">Eigener Link</option>
              </select>
            </div>

            {/* Base URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Basis-URL
              </label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
                placeholder={
                  formData.type === 'custom'
                    ? 'https://example.com'
                    : ''
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                style={{ accentColor: '#6e0147' }}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                {formData.type !== 'custom' &&
                  'Der Link wird automatisch mit Deinem Partner-Code erweitert.'}
              </p>
            </div>

            {/* Label Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label (z.B. "Mein Masterclass Link")
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Geben Sie einen beschreibenden Namen ein"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                style={{ accentColor: '#6e0147' }}
                maxLength={100}
                required
              />
            </div>

            {/* Preview */}
            {formData.baseUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vorschau der generierten URL
                </label>
                <div className="p-3 bg-gray-50 rounded-lg break-all text-sm text-gray-700 font-mono">
                  {(() => {
                    const url = new URL(formData.baseUrl)
                    url.searchParams.append('invite', partner.id)
                    return url.toString()
                  })()}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#6e0147' }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#550038'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6e0147'
                }}
              >
                {submitting ? 'Wird erstellt...' : 'Link erstellen'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">
            Noch keine Links erstellt. Erstelle Deinen ersten Link!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div key={link.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header with Label and Type Badge */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{link.label}</h3>
                  <span
                    className="inline-block mt-2 px-3 py-1 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: typeColors[link.type] }}
                  >
                    {typeLabels[link.type]}
                  </span>
                </div>
              </div>

              {/* URL - Copyable */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Tracking-URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 break-all text-gray-700">
                    {link.fullUrl}
                  </code>
                  <button
                    onClick={() => handleCopyUrl(link.fullUrl)}
                    className="px-3 py-2 text-sm font-medium text-white rounded transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        copied === link.fullUrl ? '#E8A838' : '#6e0147',
                    }}
                    onMouseEnter={(e) => {
                      if (copied !== link.fullUrl) {
                        e.currentTarget.style.backgroundColor = '#550038'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copied !== link.fullUrl) {
                        e.currentTarget.style.backgroundColor = '#6e0147'
                      }
                    }}
                  >
                    {copied === link.fullUrl ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Click Count and Date */}
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Klicks</p>
                  <p className="text-lg font-semibold" style={{ color: '#6e0147' }}>
                    {link.clickCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Erstellt</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(link.createdAt)}
                  </p>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(link.id)}
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
