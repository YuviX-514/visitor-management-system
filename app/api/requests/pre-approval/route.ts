import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import User from '@/lib/models/User'
import { authenticateRequest } from '@/lib/auth'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (authData.role !== 'employee' && authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only employees can create pre-approvals' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorCompany,
      purpose,
      requestedDate,
      requestedTime,
    } = body

    if (!visitorName || !visitorEmail || !visitorPhone || !purpose || !requestedDate || !requestedTime) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await User.findById(authData.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Set expiration to 24 hours after requested time
    const expiresAt = new Date(requestedDate)
    expiresAt.setDate(expiresAt.getDate() + 1)

    const visitRequest = await VisitRequest.create({
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorCompany,
      purpose,
      requestedDate: new Date(requestedDate),
      requestedTime,
      hostEmployeeId: authData.userId,
      hostEmployeeName: user.name,
      status: 'approved', // Pre-approvals are auto-approved
      approvedAt: new Date(),
      expiresAt,
    })

    // Generate QR code for pre-approved visit
    const qrCodeData = JSON.stringify({
      requestId: visitRequest._id,
      visitorName: visitRequest.visitorName,
      hostEmployee: user.name,
      date: requestedDate,
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)
    visitRequest.qrCode = qrCode
    await visitRequest.save()

    return NextResponse.json(visitRequest, { status: 201 })
  } catch (error) {
    console.error('Pre-approval error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
