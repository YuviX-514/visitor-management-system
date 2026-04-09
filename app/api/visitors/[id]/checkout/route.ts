import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'

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

    visitor.checkOutTime = new Date()
    visitor.status = 'checked-out'
    await visitor.save()

    // Create notification for host employee
    await Notification.create({
      userId: visitor.hostEmployeeId,
      type: 'checkout',
      title: 'Visitor Checked Out',
      message: `${visitor.fullName} has checked out`,
      relatedId: visitor._id,
    })

    return NextResponse.json(visitor)
  } catch (error) {
    console.error('Check-out error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
