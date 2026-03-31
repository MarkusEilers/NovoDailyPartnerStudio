import { getPartnerByPartnerId } from '@/lib/kv';
import QRCode from 'qrcode';
import Link from 'next/link';

interface Props {
  params: Promise<{ partnerId: string }>;
}

export default async function PublicCardPage({ params }: Props) {
  const { partnerId } = await params;

  // Fetch partner data server-side
  const partner = await getPartnerByPartnerId(partnerId);

  if (!partner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Diese Visitenkarte wurde nicht gefunden.</p>
          <Link href="/" className="text-[#6e0147] hover:underline font-medium">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  // Generate QR code pointing to this page itself
  let qrCode = '';
  try {
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://novodaily-partner-studio.vercel.app'}/p/${partnerId}`;
    qrCode = await QRCode.toDataURL(publicUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#6e0147',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with NovoDaily branding */}
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg" style={{ color: '#6e0147' }}>
                NOVO
              </span>
              <span className="font-normal text-lg" style={{ color: '#6e0147' }}>
                DAILY
              </span>
            </div>
            <span className="text-sm text-gray-500">Partner Card</span>
          </div>
        </div>
      </header>

      {/* Main Card Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Card Container */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12">
          {/* Partner Photo */}
          {partner.photoUrl && (
            <div className="mb-8 flex justify-center">
              <img
                src={partner.photoUrl}
                alt={`Profile photo of ${partner.firstName} ${partner.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#6e0147]"
              />
            </div>
          )}

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-2">
            {partner.firstName} {partner.lastName}
          </h1>

          {/* Title */}
          {partner.title && (
            <p className="text-center text-lg text-gray-700 font-semibold mb-2">
              {partner.title}
            </p>
          )}

          {/* Company */}
          {partner.company && (
            <p className="text-center text-gray-600 mb-8">{partner.company}</p>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#6e0147] to-transparent my-8"></div>

          {/* Bio Section */}
          {partner.bio && (
            <div className="mb-8 text-center">
              <p className="text-gray-700 text-lg italic">{partner.bio}</p>
            </div>
          )}

          {/* Contact Buttons */}
          <div className="space-y-3 mb-8">
            {partner.email && (
              <a
                href={`mailto:${partner.email}`}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors border-2"
                style={{
                  borderColor: '#6e0147',
                  color: '#6e0147',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6e0147';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6e0147';
                }}
              >
                <span className="text-xl">📧</span>
                <span className="font-medium">E-Mail schreiben</span>
              </a>
            )}
            {partner.phone && (
              <a
                href={`tel:${partner.phone}`}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors border-2"
                style={{
                  borderColor: '#6e0147',
                  color: '#6e0147',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6e0147';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6e0147';
                }}
              >
                <span className="text-xl">📱</span>
                <span className="font-medium">Anrufen</span>
              </a>
            )}
          </div>

          {/* Partner ID and QR Code */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-8 border-t border-gray-300">
            {/* ID Badge */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Partner ID</p>
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-mono font-bold text-white"
                style={{ backgroundColor: '#6e0147' }}
              >
                {partner.partnerId}
              </span>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Scannen</p>
                <img
                  src={qrCode}
                  alt="QR code to share this business card"
                  className="w-32 h-32 border-2 border-[#6e0147]"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 sm:mt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-600 text-sm">
            Powered by{' '}
            <a
              href="https://novodaily.com"
              className="text-[#6e0147] hover:underline font-medium"
            >
              NovoDaily
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
