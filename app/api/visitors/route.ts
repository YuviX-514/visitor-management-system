import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
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

    let visitors
    if (authData.role === 'admin' || authData.role === 'security') {
      visitors = await Visitor.find().sort({ createdAt: -1 }).limit(100)
    } else {
      visitors = await Visitor.find({ hostEmployeeId: authData.userId })
        .sort({ createdAt: -1 })
        .limit(100)
    }

    return NextResponse.json(visitors)
  } catch (error) {
    console.error('Fetch visitors error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
