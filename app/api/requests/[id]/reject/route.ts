import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'
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

    const { id } = await params

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

    visitRequest.status = 'rejected'
    visitRequest.rejectedAt = new Date()
    await visitRequest.save()

    return NextResponse.json(visitRequest)
  } catch (error) {
    console.error('Reject request error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
