import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
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

    let requests
    if (authData.role === 'admin') {
      requests = await VisitRequest.find().sort({ createdAt: -1 }).limit(100)
    } else {
      requests = await VisitRequest.find({ hostEmployeeId: authData.userId })
        .sort({ createdAt: -1 })
        .limit(100)
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Fetch requests error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
