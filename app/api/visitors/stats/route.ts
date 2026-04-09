import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const total = await Visitor.countDocuments()
    const active = await Visitor.countDocuments({ status: 'checked-in' })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = await Visitor.countDocuments({
      checkInTime: { $gte: today }
    })

    return NextResponse.json({
      total,
      active,
      today: todayCount,
    })
  } catch (error) {
    console.error('Fetch stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
