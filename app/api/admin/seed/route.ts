import { NextResponse } from 'next/server'
import { getPartners, savePartners } from '@/lib/kv'
import { hashPassword } from '@/lib/auth'
import type { Partner } from '@/lib/kv'

// POST /api/admin/seed — Create initial admin partner (only works if no partners exist)
export async function POST(req: Request) {
  const partners = await getPartners()

  // Only allow seed if no partners exist yet
  if (partners.length > 0) {
    return NextResponse.json(
      { error: 'Seed nicht möglich — es existieren bereits Partner.' },
      { status: 403 }
    )
  }

  const { partnerId, firstName, lastName, email, password } = await req.json()

  if (!partnerId || !firstName || !email || !password) {
    return NextResponse.json({ error: 'Alle Felder erforderlich.' }, { status: 400 })
  }

  const admin: Partner = {
    id: crypto.randomUUID(),
    partnerId: partnerId.toUpperCase(),
    firstName: firstName.trim(),
    lastName: (lastName ?? '').trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    approved: true,
    isAdmin: true,
    createdAt: new Date().toISOString(),
  }

  await savePartners([admin])

  return NextResponse.json({ success: true, message: 'Admin-Partner erstellt.', partnerId: admin.partnerId })
}
