
import VisitRequest from '@/lib/models/VisitRequest'

export async function expireRequestsLogic() {
  const now = new Date()

  const expiredRequests = await VisitRequest.updateMany(
    {
      isPreApproval: true,
      status: 'approved',
      expiresAt: { $lt: now },
    },
    {
      $set: {
        status: 'rejected',
        rejectedReason: 'Pre-approval expired',
        canReverse: false,
      },
    }
  )

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

  return {
    expiredPreApprovals: expiredRequests.modifiedCount,
    expiredReversals: expiredReversals.modifiedCount,
  }
}