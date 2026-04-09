import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import { sendCheckoutNotification } from '@/lib/email'

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

    if (authData.role !== 'security' && authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only security guards and admins can check out visitors' },
        { status: 403 }
      )
    }

    const { id } = await params

    const visitor = await Visitor.findById(id)
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

    // Get the current user (security guard or admin) who is checking out
    const currentUser = await User.findById(authData.userId)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Current user not found' },
        { status: 404 }
      )
    }

    const checkedOutByName = currentUser.fullName || currentUser.name || 'Unknown'

    const checkOutTime = new Date()
    visitor.checkOutTime = checkOutTime
    visitor.status = 'checked-out'
    
    // Calculate visit duration
    const checkInTime = new Date(visitor.checkInTime)
    const durationMs = checkOutTime.getTime() - checkInTime.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    visitor.visitDuration = `${hours}h ${minutes}m`
    
    // Track who checked out the visitor
    visitor.checkedOutBy = {
      userId: authData.userId,
      name: checkedOutByName,
      role: authData.role,
    }
    
    await visitor.save()

    // Send email notification to host employee about checkout
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

    // Create in-app notification for host employee
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
      message: 'Visitor checked out successfully',
      visitor,
      duration: visitor.visitDuration,
    })
  } catch (error) {
    console.error('Check-out error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
