import { useAppDispatch } from '@/lib/hooks'
import { approveRequest, rejectRequest } from '@/lib/features/requests/requestSlice'
import type { VisitRequest } from '@/lib/features/requests/requestSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface RequestsTableProps {
  requests: VisitRequest[]
  showActions?: boolean
}

export default function RequestsTable({ requests, showActions }: RequestsTableProps) {
  const dispatch = useAppDispatch()

  const handleApprove = async (requestId: string) => {
    try {
      await dispatch(approveRequest(requestId)).unwrap()
      toast.success('Request approved successfully')
    } catch (error) {
      toast.error('Failed to approve request')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await dispatch(rejectRequest(requestId)).unwrap()
      toast.success('Request rejected')
    } catch (error) {
      toast.error('Failed to reject request')
    }
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No requests found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <div className="font-medium">{request.visitorName}</div>
                  {request.visitorCompany && (
                    <div className="text-sm text-muted-foreground">{request.visitorCompany}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{request.visitorEmail}</div>
                    <div className="text-muted-foreground">{request.visitorPhone}</div>
                  </div>
                </TableCell>
                <TableCell>{request.purpose}</TableCell>
                <TableCell>{request.hostEmployeeName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(request.requestedDate), 'MMM dd, yyyy')}
                    <div className="text-muted-foreground">{request.requestedTime}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === 'approved'
                        ? 'default'
                        : request.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell>
                    {request.status === 'pending' && (
                      <ButtonGroup>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(request._id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request._id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </ButtonGroup>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
