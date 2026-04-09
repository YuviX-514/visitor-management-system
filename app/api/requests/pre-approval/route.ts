import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import User from '@/lib/models/User'
import { authenticateRequest } from '@/lib/auth'
import { validateEmail, sendPreApprovalEmail } from '@/lib/email'
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

    // Validate visitor email is real
    const isValidEmail = await validateEmail(visitorEmail)
    if (!isValidEmail) {
      return NextResponse.json(
        { message: 'Please provide a valid and real email address. Disposable/fake emails are not allowed.' },
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

    // Set expiration to 8 hours after requested arrival time
    const scheduledDateTime = new Date(`${requestedDate}T${requestedTime}`)
    const expiresAt = new Date(scheduledDateTime.getTime() + 8 * 60 * 60 * 1000) // 8 hours after arrival time

    const visitRequest = await VisitRequest.create({
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorCompany,
      purpose,
      requestedDate: new Date(requestedDate),
      requestedTime,
      hostEmployeeId: authData.userId,
      hostEmployeeName: user.fullName,
      hostEmployeeEmail: user.email,
      status: 'approved', // Pre-approvals are auto-approved
      approvedAt: new Date(),
      isPreApproval: true,
      createdBy: 'employee',
      expiresAt,
    })

    // Generate QR code for pre-approved visit
    const qrCodeData = JSON.stringify({
      requestId: visitRequest._id,
      visitorName: visitRequest.visitorName,
      visitorEmail: visitRequest.visitorEmail,
      hostEmployee: user.fullName,
      date: requestedDate,
      time: requestedTime,
      isPreApproval: true,
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)
    visitRequest.qrCode = qrCode
    await visitRequest.save()

    // Send pre-approval email with QR code to visitor
    try {
      await sendPreApprovalEmail(
        visitorEmail,
        visitorName,
        qrCodeData,
        {
          employeeName: user.fullName,
          scheduledDate: new Date(requestedDate),
          scheduledTime: requestedTime,
          purpose,
          expiresAt,
        }
      )
    } catch (emailError) {
      console.error('Pre-approval email error:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      message: 'Pre-approval created successfully. QR code sent to visitor via email.',
      request: visitRequest,
      expiresAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Pre-approval error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
