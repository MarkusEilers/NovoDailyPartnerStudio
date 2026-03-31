'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePartner } from './layout'

interface StatCard {
  icon: string
  label: string
  value: number | string
  color: string
}

interface DashboardData {
  contactsCount: number
  customersCount: number
  linkClicks: number
  weeklyTasksCompleted: number
  weeklyTasksTotal: number
}

const StatCardComponent: React.FC<{
  icon: string
  label: string
  value: number | string
  color: string
}> = ({ icon, label, value, color }) => (
  <div
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    style={{ borderTop: `4px solid ${color}` }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
)

const QuickActionCard: React.FC<{
  href: string
  icon: string
  title: string
  description: string
}> = ({ href, icon, title, description }) => (
  <Link href={href}>
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-gray-200 cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="text-3xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div
          className="text-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#6e0147' }}
        >
          →
        </div>
      </div>
    </div>
  </Link>
)

const ProgressBar: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${percentage}%`,
          backgroundColor: '#6e0147',
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const partner = usePartner()
  const [data, setData] = useState<DashboardData>({
    contactsCount: 0,
    customersCount: 0,
    linkClicks: 0,
    weeklyTasksCompleted: 0,
    weeklyTasksTotal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch prospects
        const prospectsRes = await fetch('/api/prospects')
        const prospectsData = prospectsRes.ok ? await prospectsRes.json() : []
        const contactsCount = prospectsData.length || 0
        const customersCount = prospectsData.filter(
          (p: any) => p.status === 'kunde'
        ).length || 0

        // Fetch links
        const linksRes = await fetch('/api/links')
        const linksData = linksRes.ok ? await linksRes.json() : []
        const linkClicks =
          linksData.reduce((sum: number, link: any) => sum + (link.clicks || 0), 0) || 0

        // Fetch weekly plan
        const planRes = await fetch('/api/plan')
        const planData = planRes.ok ? await planRes.json() : []
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)

        const weeklyTasks = planData.filter((task: any) => {
          const taskDate = new Date(task.date)
          return taskDate >= weekStart && taskDate < weekEnd
        })

        const weeklyTasksCompleted = weeklyTasks.filter(
          (t: any) => t.completed === true
        ).length || 0
        const weeklyTasksTotal = weeklyTasks.length || 0

        setData({
          contactsCount,
          customersCount,
          linkClicks,
          weeklyTasksCompleted,
          weeklyTasksTotal,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards: StatCard[] = [
    {
      icon: '👥',
      label: 'Kontakte',
      value: data.contactsCount,
      color: '#6e0147',
    },
    {
      icon: '⭐',
      label: 'Kunden',
      value: data.customersCount,
      color: '#E8A838',
    },
    {
      icon: '🔗',
      label: 'Link-Klicks',
      value: data.linkClicks,
      color: '#10b981',
    },
    {
      icon: '✓',
      label: 'Wochenplan',
      value: `${data.weeklyTasksCompleted}/${data.weeklyTasksTotal}`,
      color: '#3b82f6',
    },
  ]

  const quickActions = [
    {
      href: '/dashboard/card',
      icon: '💼',
      title: 'Visitenkarte verwalten',
      description: 'Erstelle und bearbeite deine digitale Visitenkarte',
    },
    {
      href: '/dashboard/links',
      icon: '🔗',
      title: 'Links hinzufügen',
      description: 'Verwalte deine Freigabelinks und Weiterleitung',
    },
    {
      href: '/dashboard/prospects',
      icon: '📋',
      title: 'Kontakte verwalten',
      description: 'Verwalte und verfolgeverfolge deine Kontakte',
    },
    {
      href: '/dashboard/plan',
      icon: '📅',
      title: 'Wochenplan erstellen',
      description: 'Planen deine wöchentlichen Aktivitäten',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen zurück, {partner.firstName}!
        </h1>
        <p className="text-gray-600">
          Hier ist ein Überblick über deine NovoDaily Partneraktivitäten
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCardComponent
            key={index}
            icon={card.icon}
            label={card.label}
            value={card.value}
            color={card.color}
          />
        ))}
      </div>

      {/* Rising Star Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              🚀 Dein Rising Star Fortschritt
            </h2>
            <p className="text-gray-600 text-sm">
              Diese Woche - Bleib dran und erreiche deine Ziele!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Weekly Tasks Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Wochenplan Fortschritt
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: '#6e0147' }}
              >
                {data.weeklyTasksCompleted}/{data.weeklyTasksTotal}
              </span>
            </div>
            <ProgressBar
              completed={data.weeklyTasksCompleted}
              total={data.weeklyTasksTotal}
            />
          </div>

          {/* Conversion Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Konvertierungsrate (Kontakte zu Kunden)
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: '#E8A838' }}
              >
                {data.contactsCount > 0
                  ? Math.round((data.customersCount / data.contactsCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <ProgressBar
              completed={data.customersCount}
              total={data.contactsCount}
            />
          </div>

          {/* Engagement */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Link-Engagement (Klicks)
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: '#10b981' }}
              >
                {data.linkClicks} Klicks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (data.linkClicks / 50) * 100)}%`,
                  backgroundColor: '#10b981',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Schnellaktionen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              href={action.href}
              icon={action.icon}
              title={action.title}
              description={action.description}
            />
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-purple-50 to-yellow-50 border border-purple-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Tipps zum Erfolg</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Fülle deine Visitenkarte aus, um professioneller zu wirken
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Teile deine Links regelmäßig mit Kontakten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Plane deine wöchentlichen Aktivitäten für bessere Ergebnisse</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Verfolge deine Kontakte und konvertiere sie in Kunden</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
