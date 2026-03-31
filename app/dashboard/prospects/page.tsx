'use client'

import React, { useEffect, useState } from 'react'
import { usePartner } from '../layout'

interface Prospect {
  id: string
  partnerId: string
  name: string
  matchPercent?: number
  status: 'informiert' | 'interessiert' | 'kunde' | 'reseller-wunsch' | 'reseller' | 'partner-wunsch' | 'partner'
  notes?: string
  erfolg?: 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
}

type ViewMode = 'pipeline' | 'table'

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  informiert: { label: 'Informiert', color: '#6e0147', bgColor: '#f3e8f7' },
  interessiert: { label: 'Interessiert', color: '#e67e22', bgColor: '#fef3e8' },
  kunde: { label: 'Ist Kunde', color: '#27ae60', bgColor: '#e8f8f1' },
  'reseller-wunsch': { label: 'Reseller-Wunsch', color: '#3498db', bgColor: '#e8f4fb' },
  reseller: { label: 'Reseller', color: '#2980b9', bgColor: '#d6edf8' },
  'partner-wunsch': { label: 'Partner-Wunsch', color: '#E8A838', bgColor: '#fef7e8' },
  partner: { label: 'Partner', color: '#d68910', bgColor: '#fdeae5' },
}

const StarsRating: React.FC<{ rating?: number; onRate?: (rating: number) => void; interactive?: boolean }> = ({
  rating = 0,
  onRate,
  interactive = false,
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={`text-lg ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ opacity: star <= rating ? 1 : 0.3 }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bgColor: '#f3f4f6' }
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      {config.label}
    </span>
  )
}

const AddEditProspectModal: React.FC<{
  isOpen: boolean
  prospect?: Prospect
  formData: Partial<Prospect>
  setFormData: (data: Partial<Prospect>) => void
  onClose: () => void
  onSave: (prospect: Partial<Prospect>) => Promise<void>
  isSaving: boolean
}> = ({ isOpen, prospect, formData, setFormData, onClose, onSave, isSaving }) => {
  const handleSave = async () => {
    await onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {prospect ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none transition-colors"
              style={{ '--tw-ring-color': '#6e0147' } as any}
              placeholder="Name des Kontakts"
            />
          </div>

          {/* Match Percent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              % Match (optional)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.matchPercent || 0}
              onChange={(e) =>
                setFormData({ ...formData, matchPercent: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none transition-colors"
              style={{ '--tw-ring-color': '#6e0147' } as any}
              placeholder="0"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={key}
                    checked={formData.status === key}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Prospect['status'] })
                    }
                    className="w-4 h-4 accent-current"
                    style={{ accentColor: '#6e0147' }}
                  />
                  <span className="text-sm text-gray-700">{config.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Erfolg Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Erfolg
            </label>
            <StarsRating
              rating={formData.erfolg || 0}
              onRate={(rating) => setFormData({ ...formData, erfolg: rating as 1 | 2 | 3 | 4 | 5 })}
              interactive
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none transition-colors resize-none"
              style={{ '--tw-ring-color': '#6e0147' } as any}
              rows={3}
              placeholder="Notizen zum Kontakt..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#6e0147' }}
            disabled={isSaving || !formData.name}
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}

const ProspectCard: React.FC<{ prospect: Prospect; onEdit: (prospect: Prospect) => void }> = ({
  prospect,
  onEdit,
}) => (
  <div
    className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onEdit(prospect)}
  >
    <div className="mb-3">
      <h3 className="font-semibold text-gray-900 truncate">{prospect.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        <StatusBadge status={prospect.status} />
        {prospect.matchPercent !== undefined && (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {prospect.matchPercent}%
          </span>
        )}
      </div>
    </div>

    {prospect.erfolg && (
      <div className="mb-2">
        <StarsRating rating={prospect.erfolg} />
      </div>
    )}

    {prospect.notes && (
      <p className="text-xs text-gray-600 line-clamp-2">{prospect.notes}</p>
    )}
  </div>
)

const PipelineView: React.FC<{ prospects: Prospect[]; onEdit: (prospect: Prospect) => void; isMobile: boolean }> = ({
  prospects,
  onEdit,
  isMobile,
}) => {
  const columns = Object.entries(STATUS_CONFIG).map(([key]) => key)

  if (isMobile) {
    return (
      <div className="space-y-6">
        {columns.map((status) => {
          const statusProspects = prospects.filter((p) => p.status === status)
          const config = STATUS_CONFIG[status]
          return (
            <div key={status}>
              <h3
                className="font-semibold mb-3 flex items-center gap-2"
                style={{ color: config.color }}
              >
                {config.label}
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-normal">
                  {statusProspects.length}
                </span>
              </h3>
              <div className="space-y-3">
                {statusProspects.map((prospect) => (
                  <ProspectCard key={prospect.id} prospect={prospect} onEdit={onEdit} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const statusProspects = prospects.filter((p) => p.status === status)
        const config = STATUS_CONFIG[status]
        return (
          <div
            key={status}
            className="flex-shrink-0 bg-gray-50 rounded-lg p-4"
            style={{ minWidth: '280px' }}
          >
            <h3
              className="font-semibold mb-4 flex items-center gap-2"
              style={{ color: config.color }}
            >
              {config.label}
              <span className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full font-normal">
                {statusProspects.length}
              </span>
            </h3>
            <div className="space-y-3">
              {statusProspects.map((prospect) => (
                <ProspectCard key={prospect.id} prospect={prospect} onEdit={onEdit} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const TableView: React.FC<{ prospects: Prospect[]; onEdit: (prospect: Prospect) => void; onDelete: (id: string) => void }> = ({
  prospects,
  onEdit,
  onDelete,
}) => {
  const sortedProspects = [...prospects].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">% Match</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Erfolg</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Notizen</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {sortedProspects.map((prospect) => (
            <tr key={prospect.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{prospect.name}</td>
              <td className="px-4 py-3 text-center text-gray-600">
                {prospect.matchPercent !== undefined ? `${prospect.matchPercent}%` : '-'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={prospect.status} />
              </td>
              <td className="px-4 py-3 text-center">
                {prospect.erfolg ? <StarsRating rating={prospect.erfolg} /> : '-'}
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                {prospect.notes || '-'}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onEdit(prospect)}
                  className="text-blue-600 hover:text-blue-800 transition-colors mr-3"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => onDelete(prospect.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const StatsBar: React.FC<{ prospects: Prospect[] }> = ({ prospects }) => {
  const stats = {
    total: prospects.length,
    byStatus: Object.keys(STATUS_CONFIG).reduce(
      (acc, status) => ({
        ...acc,
        [status]: prospects.filter((p) => p.status === status).length,
      }),
      {} as Record<string, number>
    ),
    avgErfolg:
      prospects.length > 0
        ? Math.round(
            prospects.reduce((sum, p) => sum + (p.erfolg || 0), 0) / prospects.length
          )
        : 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-1">Gesamt Kontakte</p>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      </div>
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-1">Kunden</p>
        <p className="text-2xl font-bold" style={{ color: '#27ae60' }}>
          {stats.byStatus.kunde}
        </p>
      </div>
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-1">Partner</p>
        <p className="text-2xl font-bold" style={{ color: '#d68910' }}>
          {stats.byStatus.partner}
        </p>
      </div>
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-1">Ø Erfolg</p>
        <p className="text-2xl font-bold" style={{ color: '#E8A838' }}>
          {stats.avgErfolg}/5
        </p>
      </div>
    </div>
  )
}

export default function ProspectsPage() {
  const partner = usePartner()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | undefined>(undefined)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState<Partial<Prospect>>({
    name: '',
    matchPercent: 0,
    status: 'informiert',
    notes: '',
    erfolg: undefined,
  })

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch prospects
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/prospects')
        if (!res.ok) throw new Error('Failed to fetch prospects')
        const data = await res.json()
        setProspects(data)
      } catch (error) {
        console.error('Failed to fetch prospects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProspects()
  }, [])

  // Filter prospects
  useEffect(() => {
    let filtered = prospects

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredProspects(filtered)
  }, [prospects, searchTerm, statusFilter])

  const handleOpenModal = (prospect?: Prospect) => {
    if (prospect) {
      setFormData({
        name: prospect.name,
        matchPercent: prospect.matchPercent,
        status: prospect.status,
        notes: prospect.notes,
        erfolg: prospect.erfolg,
      })
      setEditingProspect(prospect)
    } else {
      setFormData({
        name: '',
        matchPercent: 0,
        status: 'informiert',
        notes: '',
        erfolg: undefined,
      })
      setEditingProspect(undefined)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProspect(undefined)
    setFormData({
      name: '',
      matchPercent: 0,
      status: 'informiert',
      notes: '',
      erfolg: undefined,
    })
  }

  const handleSaveProspect = async (formData: Partial<Prospect>) => {
    setIsSaving(true)
    try {
      if (editingProspect) {
        // Update existing prospect
        const res = await fetch('/api/prospects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProspect.id, ...formData }),
        })
        if (!res.ok) throw new Error('Failed to update prospect')
        const updated = await res.json()
        setProspects(prospects.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        // Create new prospect
        const res = await fetch('/api/prospects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to create prospect')
        const created = await res.json()
        setProspects([...prospects, created])
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save prospect:', error)
      alert('Failed to save prospect')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProspect = async (id: string) => {
    if (!confirm('Möchtest du diesen Kontakt wirklich löschen?')) return

    try {
      const res = await fetch(`/api/prospects?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete prospect')
      setProspects(prospects.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Failed to delete prospect:', error)
      alert('Failed to delete prospect')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Wird geladen...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Namensliste</h1>
          <p className="text-gray-600 text-sm mt-1">
            Verwalte deine Kontakte und verfolgeverfolge deinen Verkaufstrichter
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-lg text-white font-medium transition-colors whitespace-nowrap"
          style={{ backgroundColor: '#6e0147' }}
        >
          Kontakt hinzufügen
        </button>
      </div>

      {/* Empty State */}
      {prospects.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <p className="text-gray-600 mb-4">Deine Namensliste ist noch leer. Füge Deinen ersten Kontakt hinzu!</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: '#6e0147' }}
          >
            Ersten Kontakt hinzufügen
          </button>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <StatsBar prospects={prospects} />

          {/* Filters and Controls */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Nach Name suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none transition-colors"
                style={{ '--tw-ring-color': '#6e0147' } as any}
              />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none transition-colors"
                style={{ '--tw-ring-color': '#6e0147' } as any}
              >
                <option value="">Alle Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'pipeline'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ backgroundColor: viewMode === 'pipeline' ? '#6e0147' : undefined }}
                >
                  Pipeline
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ backgroundColor: viewMode === 'table' ? '#6e0147' : undefined }}
                >
                  Tabelle
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Zeige {filteredProspects.length} von {prospects.length} Kontakten
            </div>
          </div>

          {/* Views */}
          {filteredProspects.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-600">Keine Kontakte gefunden. Versuche die Filter zu ändern.</p>
            </div>
          ) : viewMode === 'pipeline' ? (
            <PipelineView prospects={filteredProspects} onEdit={handleOpenModal} isMobile={isMobile} />
          ) : (
            <TableView prospects={filteredProspects} onEdit={handleOpenModal} onDelete={handleDeleteProspect} />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <AddEditProspectModal
        isOpen={isModalOpen}
        prospect={editingProspect}
        formData={formData}
        setFormData={setFormData}
        onClose={handleCloseModal}
        onSave={handleSaveProspect}
        isSaving={isSaving}
      />
    </div>
  )
}
