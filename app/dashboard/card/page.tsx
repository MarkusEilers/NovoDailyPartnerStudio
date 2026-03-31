'use client'

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface CardData {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  title: string
  company: string
  photoUrl: string
  partnerId: string
}

export default function CardPage() {
  const [cardData, setCardData] = useState<CardData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    title: '',
    company: '',
    photoUrl: '',
    partnerId: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [qrCode, setQrCode] = useState<string>('')
  const [photoPreview, setPhotoPreview] = useState<string>('')

  // Fetch card data on mount
  useEffect(() => {
    const loadCardData = async () => {
      try {
        const response = await globalThis.fetch('/api/partners/card')
        if (!response.ok) {
          throw new Error('Failed to fetch card data')
        }
        const data = await response.json()
        setCardData(data.card)
        setPhotoPreview(data.card.photoUrl || '')
      } catch (error) {
        console.error('Error fetching card data:', error)
        showToastMessage('Fehler beim Laden der Visitenkarte')
      } finally {
        setIsLoading(false)
      }
    }
    loadCardData()
  }, [])

  // Generate QR code when partnerId changes
  useEffect(() => {
    if (cardData.partnerId) {
      const publicUrl = `${window.location.origin}/p/${cardData.partnerId}`
      QRCode.toDataURL(publicUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#6e0147',
          light: '#ffffff',
        },
      }).then((url) => {
        setQrCode(url)
      }).catch((err) => {
        console.error('QR code generation error:', err)
      })
    }
  }, [cardData.partnerId])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setPhotoPreview(dataUrl)
        setCardData((prev) => ({
          ...prev,
          photoUrl: dataUrl,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/partners/card', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save card')
      }

      const data = await response.json()
      setCardData(data.card)
      showToastMessage('Visitenkarte erfolgreich gespeichert!')
    } catch (error) {
      console.error('Error saving card:', error)
      showToastMessage(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/p/${cardData.partnerId}`
    try {
      await navigator.clipboard.writeText(publicUrl)
      showToastMessage('Link kopiert!')
    } catch (error) {
      console.error('Copy to clipboard error:', error)
      showToastMessage('Fehler beim Kopieren')
    }
  }

  const handleDownloadPdf = () => {
    showToastMessage('PDF-Export kommt bald!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN - EDIT FORM */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Deine Visitenkarte</h2>
          <span className="text-xl">✏️</span>
        </div>

        {/* Photo Upload Area */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Foto</label>
          <div className="relative w-32 h-32">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Partner photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">📷</span>
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">📷</span>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
            <input
              type="text"
              name="firstName"
              value={cardData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent"
              placeholder="Vorname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
            <input
              type="text"
              name="lastName"
              value={cardData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent"
              placeholder="Nachname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel / Position</label>
            <input
              type="text"
              name="title"
              value={cardData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent"
              placeholder="z.B. Geschäftsführer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unternehmen</label>
            <input
              type="text"
              name="company"
              value={cardData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent"
              placeholder="Unternehmensname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              name="email"
              value={cardData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              name="phone"
              value={cardData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent"
              placeholder="+49 (0) 123 456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Über mich ({cardData.bio.length}/200)
            </label>
            <textarea
              name="bio"
              value={cardData.bio}
              onChange={handleInputChange}
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e0147] focus:border-transparent resize-none"
              placeholder="Schreib ein paar Worte über dich..."
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-8 px-6 py-3 bg-white rounded-lg font-medium transition-all duration-200"
          style={{
            backgroundColor: isSaving ? '#e5e7eb' : '#6e0147',
            color: '#ffffff',
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#5a0039'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#6e0147'
            }
          }}
        >
          {isSaving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>

      {/* RIGHT COLUMN - LIVE PREVIEW */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 h-fit lg:sticky lg:top-32">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Vorschau</h3>

        {/* Card Preview */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 sm:p-8 shadow-md mb-6">
          {/* Partner Photo */}
          {photoPreview && (
            <div className="mb-6 flex justify-center">
              <img
                src={photoPreview}
                alt="Partner preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#6e0147]"
              />
            </div>
          )}

          {/* Name */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            {cardData.firstName} {cardData.lastName}
          </h2>

          {/* Title */}
          {cardData.title && (
            <p className="text-center text-gray-700 font-medium mb-1">{cardData.title}</p>
          )}

          {/* Company */}
          {cardData.company && (
            <p className="text-center text-gray-600 mb-4">{cardData.company}</p>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-300 my-4"></div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {cardData.email && (
              <a
                href={`mailto:${cardData.email}`}
                className="flex items-center gap-2 text-gray-700 hover:text-[#6e0147] transition-colors"
              >
                <span>📧</span>
                <span className="text-sm break-all">{cardData.email}</span>
              </a>
            )}
            {cardData.phone && (
              <a
                href={`tel:${cardData.phone}`}
                className="flex items-center gap-2 text-gray-700 hover:text-[#6e0147] transition-colors"
              >
                <span>📱</span>
                <span className="text-sm">{cardData.phone}</span>
              </a>
            )}
          </div>

          {/* Bio */}
          {cardData.bio && (
            <>
              <div className="h-px bg-gray-300 my-4"></div>
              <p className="text-center text-gray-700 text-sm italic">{cardData.bio}</p>
            </>
          )}

          {/* Partner ID Badge */}
          <div className="h-px bg-gray-300 my-4"></div>
          <div className="flex justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold text-white"
              style={{ backgroundColor: '#6e0147' }}
            >
              {cardData.partnerId}
            </span>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="QR code for business card"
                className="w-32 h-32 border-2 border-[#6e0147]"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-3 bg-white border-2 border-[#6e0147] text-[#6e0147] rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            🔗 Link kopieren
          </button>
          <button
            onClick={handleDownloadPdf}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            📄 Als PDF
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
