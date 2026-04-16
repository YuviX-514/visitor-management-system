import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import Visitor from '@/lib/models/Visitor'
import Notification from '@/lib/models/Notification'
import { sendApprovalEmailWithQR } from '@/lib/email'
import QRCode from 'qrcode'
import { expireRequestsLogic } from '@/lib/expireRequests'

// 🔐 EMAIL TOKEN CHECK
function verifyEmailToken(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  return token === process.env.EMAIL_SECRET
}

// ✅ PATCH (for internal use / dashboard)
export async function PATCH(request: NextRequest, { params }: any) {
  await dbConnect()
  await expireRequestsLogic()

  const { id } = params

  const visitRequest = await VisitRequest.findById(id)
  if (!visitRequest) {
    return NextResponse.json({ message: 'Request not found' }, { status: 404 })
  }

  if (visitRequest.status !== 'pending') {
    return NextResponse.json({ message: 'Already processed' }, { status: 400 })
  }

  visitRequest.status = 'approved'
  visitRequest.approvedAt = new Date()
  visitRequest.canReverse = false

  const qrCodeData = JSON.stringify({
    requestId: visitRequest._id,
    visitorName: visitRequest.visitorName,
  })

  const qrCode = await QRCode.toDataURL(qrCodeData)
  visitRequest.qrCode = qrCode
  await visitRequest.save()

  await Visitor.create({
    fullName: visitRequest.visitorName,
    email: visitRequest.visitorEmail,
    phoneNumber: visitRequest.visitorPhone,
    purpose: visitRequest.purpose,
    hostEmployeeId: visitRequest.hostEmployeeId,
    checkInTime: new Date(),
    status: 'checked-in',
    qrCode,
    requestId: visitRequest._id,
  })

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

  return NextResponse.json({ message: 'Approved successfully' })
}

// ✅ GET (for email click)
export async function GET(request: NextRequest, { params }: any) {
  try {
    if (!verifyEmailToken(request)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await PATCH(request, { params })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )
  } catch (err) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=true`
    )
  }
}