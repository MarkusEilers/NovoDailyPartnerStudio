'use client'

import React, { useEffect, useState } from 'react'
import { Partner } from '@/lib/kv'

interface StatCard {
  label: string
  value: number
  color: string
}

const StatCardComponent: React.FC<{
  label: string
  value: number
  color: string
}> = ({ label, value, color }) => (
  <div
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    style={{ borderTop: `4px solid ${color}` }}
  >
    <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
)

const StatusBadge: React.FC<{ approved: boolean }> = ({ approved }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      approved
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {approved ? 'Freigegeben' : 'Wartend'}
  </span>
)

export default function AdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch partners on mount
  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/partners')

      if (!response.ok) {
        throw new Error('Failed to fetch partners')
      }

      const data = await response.json()
      setPartners(data)
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError('Fehler beim Laden der Partner')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (partnerId: string, currentApproved: boolean) => {
    try {
      setActionLoading(partnerId)
      const response = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partnerId,
          approved: !currentApproved,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update partner')
      }

      // Update local state
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partnerId ? { ...p, approved: !currentApproved } : p
        )
      )
    } catch (err) {
      console.error('Error updating partner:', err)
      setError('Fehler beim Aktualisieren des Partners')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleAdmin = async (partnerId: string, currentIsAdmin: boolean) => {
    try {
      setActionLoading(partnerId)
      const response = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partnerId,
          isAdmin: !currentIsAdmin,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update partner')
      }

      // Update local state
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partnerId ? { ...p, isAdmin: !currentIsAdmin } : p
        )
      )
    } catch (err) {
      console.error('Error updating partner:', err)
      setError('Fehler beim Aktualisieren des Partners')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (partnerId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Partner löschen möchten?')) {
      return
    }

    try {
      setActionLoading(partnerId)
      const response = await fetch(`/api/admin/partners?id=${partnerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete partner')
      }

      // Update local state
      setPartners((prev) => prev.filter((p) => p.id !== partnerId))
    } catch (err) {
      console.error('Error deleting partner:', err)
      setError('Fehler beim Löschen des Partners')
    } finally {
      setActionLoading(null)
    }
  }

  // Filter partners based on search and pending filter
  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partnerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPending = !showPendingOnly || !p.approved

    return matchesSearch && matchesPending
  })

  // Calculate stats
  const totalPartners = partners.length
  const approvedPartners = partners.filter((p) => p.approved).length
  const pendingPartners = partners.filter((p) => !p.approved).length

  const statCards: StatCard[] = [
    {
      label: 'Gesamt Partner',
      value: totalPartners,
      color: '#6e0147',
    },
    {
      label: 'Freigegeben',
      value: approvedPartners,
      color: '#10b981',
    },
    {
      label: 'Wartend',
      value: pendingPartners,
      color: '#f59e0b',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Wird geladen...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partner-Verwaltung</h1>
        <p className="text-gray-600 mt-1">
          Verwalte und genehmige alle registrierten Partner
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <StatCardComponent
            key={index}
            label={card.label}
            value={card.value}
            color={card.color}
          />
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suche nach Name, Partner-ID oder E-Mail
            </label>
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Pending Filter Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pending-filter"
              checked={showPendingOnly}
              onChange={(e) => setShowPendingOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="pending-filter"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Nur wartende
            </label>
          </div>
        </div>

        {filteredPartners.length === 0 && partners.length > 0 && (
          <p className="text-sm text-gray-600">
            Keine Partner gefunden, die den Suchkriterien entsprechen.
          </p>
        )}
      </div>

      {/* Partners Table */}
      {partners.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600 text-lg">Keine Partner registriert</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Partner-ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    E-Mail
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Registriert am
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {partner.firstName} {partner.lastName}
                        </span>
                        {partner.isAdmin && (
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: '#6e0147' }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{partner.partnerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{partner.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(partner.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge approved={partner.approved} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(partner.id, partner.approved)}
                          disabled={actionLoading === partner.id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            partner.approved
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {partner.approved ? 'Sperren' : 'Freigeben'}
                        </button>

                        <button
                          onClick={() => handleToggleAdmin(partner.id, partner.isAdmin || false)}
                          disabled={actionLoading === partner.id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            partner.isAdmin
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {partner.isAdmin ? 'Admin entf.' : 'Admin'}
                        </button>

                        <button
                          onClick={() => handleDelete(partner.id)}
                          disabled={actionLoading === partner.id}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">Übersicht</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              {totalPartners} registrierte Partner insgesamt
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              {approvedPartners} freigegeben, {pendingPartners} wartend
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Genehmige Partner oder erteile ihnen Admin-Rechte mit den Aktionsschaltflächen
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
