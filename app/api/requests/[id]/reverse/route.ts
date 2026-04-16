import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import { sendApprovalEmailWithQR } from '@/lib/email'
import QRCode from 'qrcode'
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

  if (visitRequest.status !== 'rejected') {
    return NextResponse.json({ message: 'Only rejected can be reversed' }, { status: 400 })
  }

  if (
    !visitRequest.canReverse ||
    (visitRequest.reversalDeadline && new Date() > visitRequest.reversalDeadline)
  ) {
    return NextResponse.json(
      { message: 'Reversal window expired' },
      { status: 400 }
    )
  }

  visitRequest.status = 'approved'
  visitRequest.approvedAt = new Date()
  visitRequest.canReverse = false
  visitRequest.reversalDeadline = undefined

  const qrCodeData = JSON.stringify({
    requestId: visitRequest._id,
    visitorName: visitRequest.visitorName,
  })

  const qrCode = await QRCode.toDataURL(qrCodeData)
  visitRequest.qrCode = qrCode

  await visitRequest.save()

  try {
    await sendApprovalEmailWithQR(
      visitRequest.visitorEmail,
      visitRequest.visitorName,
      qrCodeData,
      {
        employeeName: visitRequest.hostEmployeeName,
        date: visitRequest.requestedDate,
        purpose: visitRequest.purpose,
      }
    )
  } catch {}

  return NextResponse.json({ message: 'Reversed & approved' })
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