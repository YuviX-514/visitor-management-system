import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await Notification.updateMany(
      { userId: authData.userId, isRead: false },
      { $set: { isRead: true } }
    )

    return NextResponse.json({
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
