import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
import { authenticateRequest } from '@/lib/auth'
import { expireRequestsLogic } from '@/lib/expireRequests'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    await expireRequestsLogic()

    const authData = await authenticateRequest(request)
    if (!authData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    let query: any = { status: 'pending' }

    // Security and admin see all pending; employees see only their own
    if (authData.role === 'employee') {
      query.hostEmployeeId = authData.userId
    }

    const requests = await VisitRequest.find(query).sort({ createdAt: -1 }).limit(50)
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Fetch pending requests error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
