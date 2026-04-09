import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import VisitRequest from '@/lib/models/VisitRequest'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import { sendCheckoutNotification } from '@/lib/email'

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

    if (authData.role !== 'security' && authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only security guards can scan QR codes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { qrData } = body

    if (!qrData) {
      return NextResponse.json(
        { message: 'QR code data is required' },
        { status: 400 }
      )
    }

    let parsedData
    try {
      parsedData = JSON.parse(qrData)
    } catch {
      return NextResponse.json(
        { message: 'Invalid QR code format' },
        { status: 400 }
      )
    }

    const { requestId, visitorId } = parsedData

    // Check if this is a check-out scan (visitor already exists)
    if (visitorId) {
      const visitor = await Visitor.findById(visitorId)
      if (!visitor) {
        return NextResponse.json(
          { message: 'Visitor not found' },
          { status: 404 }
        )
      }

      if (visitor.status === 'checked-out') {
        return NextResponse.json(
          { message: 'Visitor already checked out' },
          { status: 400 }
        )
      }

      // Perform checkout
      const checkOutTime = new Date()
      visitor.checkOutTime = checkOutTime
      visitor.status = 'checked-out'
      
      // Calculate visit duration
      const checkInTime = new Date(visitor.checkInTime)
      const durationMs = checkOutTime.getTime() - checkInTime.getTime()
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      visitor.visitDuration = `${hours}h ${minutes}m`
      
      await visitor.save()

      // Send checkout email
      if (visitor.hostEmployeeEmail && !visitor.checkoutEmailSent) {
        try {
          await sendCheckoutNotification(
            visitor.hostEmployeeEmail,
            visitor.hostEmployeeName,
            {
              name: visitor.fullName,
              checkInTime: visitor.checkInTime,
              checkOutTime: visitor.checkOutTime,
              duration: visitor.visitDuration,
            }
          )
          visitor.checkoutEmailSent = true
          await visitor.save()
        } catch (emailError) {
          console.error('Checkout email error:', emailError)
        }
      }

      // Create notification
      try {
        await Notification.create({
          userId: visitor.hostEmployeeId,
          type: 'checkout',
          title: 'Visitor Checked Out',
          message: `${visitor.fullName} has checked out. Visit duration: ${visitor.visitDuration}`,
          relatedId: visitor._id,
          isRead: false,
        })
      } catch (notifError) {
        console.error('Notification error:', notifError)
      }

      return NextResponse.json({
        action: 'checkout',
        message: 'Visitor checked out successfully',
        visitor,
      })
    }

    // This is a check-in scan (from approved request or pre-approval)
    if (requestId) {
      const visitRequest = await VisitRequest.findById(requestId)
      if (!visitRequest) {
        return NextResponse.json(
          { message: 'Visit request not found' },
          { status: 404 }
        )
      }

      if (visitRequest.status !== 'approved') {
        return NextResponse.json(
          { message: 'Visit request is not approved' },
          { status: 400 }
        )
      }

      // Check if pre-approval has expired
      if (visitRequest.isPreApproval && new Date() > visitRequest.expiresAt) {
        return NextResponse.json(
          { message: 'Pre-approval has expired. It was valid for 8 hours after scheduled time.' },
          { status: 400 }
        )
      }

      // Create visitor check-in record
      const visitor = await Visitor.create({
        fullName: visitRequest.visitorName,
        email: visitRequest.visitorEmail,
        phoneNumber: visitRequest.visitorPhone,
        company: visitRequest.visitorCompany,
        purpose: visitRequest.purpose,
        hostEmployeeId: visitRequest.hostEmployeeId,
        hostEmployeeName: visitRequest.hostEmployeeName,
        hostEmployeeEmail: visitRequest.hostEmployeeEmail,
        photoUrl: '/placeholder-user.jpg', // In production, capture photo at kiosk
        checkInTime: new Date(),
        status: 'checked-in',
        qrCode: visitRequest.qrCode,
        requestId: visitRequest._id,
      })

      // Create notification for host employee
      try {
        await Notification.create({
          userId: visitRequest.hostEmployeeId,
          type: 'checkin',
          title: 'Visitor Checked In',
          message: `${visitRequest.visitorName} has checked in to see you`,
          relatedId: visitor._id,
          isRead: false,
        })
      } catch (notifError) {
        console.error('Notification error:', notifError)
      }

      return NextResponse.json({
        action: 'checkin',
        message: 'Visitor checked in successfully',
        visitor,
      })
    }

    return NextResponse.json(
      { message: 'Invalid QR code data' },
      { status: 400 }
    )
  } catch (error) {
    console.error('QR scan error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
