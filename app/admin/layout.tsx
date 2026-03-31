'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Partner {
  id: string
  email: string
  firstName: string
  lastName: string
  isAdmin?: boolean
  approved: boolean
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        const partnerData = data.partner || data

        // Check if user is admin
        if (!partnerData.isAdmin || !partnerData.approved) {
          router.push('/dashboard')
          return
        }

        setPartner(partnerData)
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
    <div className="flex flex-col min-h-screen bg-[#f8f9fb]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left side - Branding */}
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-bold text-lg" style={{ color: '#6e0147' }}>
              NOVODAILY
            </span>
            <span className="font-normal text-lg text-gray-700">ADMIN</span>
          </Link>

          {/* Right side - Links and logout */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors"
              style={{
                color: '#6e0147',
              }}
            >
              Zum Dashboard
            </Link>
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
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
