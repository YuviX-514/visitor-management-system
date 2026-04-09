import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
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
        { message: 'Not authorized to reverse this request' },
        { status: 403 }
      )
    }

    if (visitRequest.status !== 'rejected') {
      return NextResponse.json(
        { message: 'Only rejected requests can be reversed' },
        { status: 400 }
      )
    }

    // Check if reversal window has expired
    if (!visitRequest.canReverse || (visitRequest.reversalDeadline && new Date() > visitRequest.reversalDeadline)) {
      return NextResponse.json(
        { message: 'Reversal window has expired. You had 10 minutes to reverse the rejection.' },
        { status: 400 }
      )
    }

    // Reverse the rejection - approve the request
    visitRequest.status = 'approved'
    visitRequest.approvedAt = new Date()
    visitRequest.canReverse = false
    visitRequest.reversalDeadline = undefined

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
    }

    // Create notification
    try {
      await Notification.create({
        userId: visitRequest.hostEmployeeId,
        type: 'approval',
        title: 'Rejection Reversed - Request Approved',
        message: `You reversed your rejection and approved ${visitRequest.visitorName}'s visit request. QR code sent to ${visitRequest.visitorEmail}`,
        relatedId: visitRequest._id,
        isRead: false,
      })
    } catch (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({
      message: 'Rejection reversed successfully. Request is now approved and QR code sent to visitor.',
      request: visitRequest,
    })
  } catch (error) {
    console.error('Reverse request error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
