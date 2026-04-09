import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import Visitor from '@/lib/models/Visitor'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import { sendApprovalEmailWithQR } from '@/lib/email'
import QRCode from 'qrcode'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const visitRequest = await VisitRequest.findById(id)
    if (!visitRequest) {
      return NextResponse.json(
        { message: 'Request not found' },
        { status: 404 }
      )
    }

    if (visitRequest.hostEmployeeId.toString() !== authData.userId && authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to approve this request' },
        { status: 403 }
      )
    }

    if (visitRequest.status !== 'pending') {
      return NextResponse.json(
        { message: 'Request already processed' },
        { status: 400 }
      )
    }

    // Update request status
    visitRequest.status = 'approved'
    visitRequest.approvedAt = new Date()
    visitRequest.canReverse = false // Once approved, can't reverse

    // Generate QR code for visitor
    const qrCodeData = JSON.stringify({
      requestId: visitRequest._id,
      visitorName: visitRequest.visitorName,
      visitorEmail: visitRequest.visitorEmail,
      hostEmployee: visitRequest.hostEmployeeName,
      approvedAt: visitRequest.approvedAt,
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)
    visitRequest.qrCode = qrCode
    await visitRequest.save()

    // Create actual Visitor record now that it's approved (checked-in status)
    const visitor = await Visitor.create({
      fullName: visitRequest.visitorName,
      email: visitRequest.visitorEmail,
      phoneNumber: visitRequest.visitorPhone,
      company: visitRequest.visitorCompany,
      purpose: visitRequest.purpose,
      hostEmployeeId: visitRequest.hostEmployeeId,
      hostEmployeeName: visitRequest.hostEmployeeName,
      hostEmployeeEmail: visitRequest.hostEmployeeEmail,
      photoUrl: visitRequest.visitorPhotoUrl || '',
      checkInTime: new Date(),
      status: 'checked-in',
      qrCode,
      requestId: visitRequest._id,
      checkoutEmailSent: false,
      checkedInBy: visitRequest.requestedBy || {
        userId: authData.userId,
        name: visitRequest.hostEmployeeName,
        role: 'security',
      },
    })

    // Send approval email with QR code to visitor
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
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Continue even if email fails
    }

    // Create notification for host employee
    try {
      await Notification.create({
        userId: visitRequest.hostEmployeeId,
        type: 'approval',
        title: 'Visit Request Approved',
        message: `You approved ${visitRequest.visitorName}'s visit request. Visitor is now checked in.`,
        relatedId: visitor._id,
        isRead: false,
      })
    } catch (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({
      message: 'Request approved. Visitor is now checked in.',
      request: visitRequest,
      visitor,
    })
  } catch (error) {
    console.error('Approve request error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
