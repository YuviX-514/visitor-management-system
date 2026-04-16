import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import { sendDenialEmail } from '@/lib/email'
import { expireRequestsLogic } from '@/lib/expireRequests'

// 🔐 TOKEN CHECK
function verifyEmailToken(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  return token === process.env.EMAIL_SECRET
}

// ✅ PATCH (dashboard use)
export async function PATCH(request: NextRequest, { params }: any) {
  await dbConnect()
  await expireRequestsLogic()

  const { id } = params

  const visitRequest = await VisitRequest.findById(id)
  if (!visitRequest) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  if (visitRequest.status !== 'pending') {
    return NextResponse.json({ message: 'Already processed' }, { status: 400 })
  }

  visitRequest.status = 'rejected'
  visitRequest.rejectedAt = new Date()
  visitRequest.canReverse = true
  visitRequest.reversalDeadline = new Date(Date.now() + 10 * 60 * 1000)

  await visitRequest.save()

  try {
    await sendDenialEmail(
      visitRequest.visitorEmail,
      visitRequest.visitorName,
      visitRequest.hostEmployeeName
    )
  } catch {}

  return NextResponse.json({ message: 'Rejected successfully' })
}

// ✅ GET (email click)
export async function GET(request: NextRequest, { params }: any) {
  try {
    if (!verifyEmailToken(request)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await PATCH(request, { params })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=true`
    )
  }
}