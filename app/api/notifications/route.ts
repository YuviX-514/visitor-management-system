import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import { expireRequestsLogic } from '@/lib/expireRequests'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    await expireRequestsLogic()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const notifications = await Notification.find({ userId: authData.userId })
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({
      userId: authData.userId,
      read: false,
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
