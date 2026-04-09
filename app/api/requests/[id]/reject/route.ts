import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import { sendDenialEmail } from '@/lib/email'

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
    const body = await request.json()
    const { reason } = body

    const visitRequest = await VisitRequest.findById(id)
    if (!visitRequest) {
      return NextResponse.json(
        { message: 'Request not found' },
        { status: 404 }
      )
    }

    if (visitRequest.hostEmployeeId.toString() !== authData.userId && authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to reject this request' },
        { status: 403 }
      )
    }

    if (visitRequest.status !== 'pending') {
      return NextResponse.json(
        { message: 'Request already processed' },
        { status: 400 }
      )
    }

    // Set rejection with 10-minute reversal window
    visitRequest.status = 'rejected'
    visitRequest.rejectedAt = new Date()
    visitRequest.rejectedReason = reason
    visitRequest.canReverse = true
    visitRequest.reversalDeadline = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    await visitRequest.save()

    // Send denial email
    try {
      await sendDenialEmail(
        visitRequest.visitorEmail,
        visitRequest.visitorName,
        visitRequest.hostEmployeeName,
        reason
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
    }

    // Create notification
    try {
      await Notification.create({
        userId: visitRequest.hostEmployeeId,
        type: 'rejection',
        title: 'Visit Request Rejected',
        message: `You rejected ${visitRequest.visitorName}'s visit request. You have 10 minutes to reverse this decision.`,
        relatedId: visitRequest._id,
        isRead: false,
      })
    } catch (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({
      message: 'Request rejected. You have 10 minutes to reverse this decision.',
      request: visitRequest,
      reversalDeadline: visitRequest.reversalDeadline,
    })
  } catch (error) {
    console.error('Reject request error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
