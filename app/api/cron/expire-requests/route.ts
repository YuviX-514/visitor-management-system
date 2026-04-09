import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VisitRequest from '@/lib/models/VisitRequest'

// This endpoint should be called periodically (e.g., every hour) to expire old requests
// Configure in vercel.json or use a cron service
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const now = new Date()

    // Find all expired pre-approvals that are still marked as approved
    const expiredRequests = await VisitRequest.updateMany(
      {
        isPreApproval: true,
        status: 'approved',
        expiresAt: { $lt: now },
      },
      {
        $set: {
          status: 'rejected',
          rejectedReason: 'Pre-approval expired (8 hours after scheduled time)',
          canReverse: false,
        },
      }
    )

    // Expire reversal windows for rejected requests
    const expiredReversals = await VisitRequest.updateMany(
      {
        status: 'rejected',
        canReverse: true,
        reversalDeadline: { $lt: now },
      },
      {
        $set: {
          canReverse: false,
        },
      }
    )

    return NextResponse.json({
      message: 'Expiration check completed',
      expiredPreApprovals: expiredRequests.modifiedCount,
      expiredReversals: expiredReversals.modifiedCount,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Expiration cron error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
