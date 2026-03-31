'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Partner {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  createdAt: string
}

const PartnerContext = createContext<Partner | null>(null)

export function usePartner() {
  const context = useContext(PartnerContext)
  if (!context) {
    throw new Error('usePartner must be used within PartnerProvider')
  }
  return context
}

interface NavItem {
  icon: string
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: '📊', label: 'Dashboard', href: '/dashboard' },
  { icon: '💼', label: 'Visitenkarte', href: '/dashboard/card' },
  { icon: '🔗', label: 'Links', href: '/dashboard/links' },
  { icon: '📋', label: 'Namensliste', href: '/dashboard/prospects' },
  { icon: '📅', label: 'Wochenplan', href: '/dashboard/plan' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        setPartner(data)
      } catch (error) {
        console.error('Failed to fetch partner data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchPartner()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!partner) {
    return null
  }

  return (
    <PartnerContext.Provider value={partner}>
      <div className="flex flex-col min-h-screen bg-[#f8f9fb]">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left side - Branding */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="font-bold text-lg" style={{ color: '#6e0147' }}>
                  NOVO
                </span>
                <span className="font-normal text-lg" style={{ color: '#6e0147' }}>
                  DAILY PARTNER STUDIO
                </span>
              </Link>
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {partner.firstName} {partner.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: '#6e0147',
                  borderColor: '#6e0147',
                  border: '1px solid',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Abmelden
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="overflow-x-auto border-t border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 flex gap-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2"
                    style={{
                      color: isActive ? '#6e0147' : '#6b7280',
                      borderColor: isActive ? '#6e0147' : 'transparent',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </PartnerContext.Provider>
  )
}
