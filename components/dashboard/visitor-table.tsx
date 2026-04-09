import { useAppDispatch } from '@/lib/hooks'
import { checkOutVisitor } from '@/lib/features/visitors/visitorSlice'
import type { Visitor } from '@/lib/features/visitors/visitorSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface VisitorTableProps {
  visitors: Visitor[]
  showCheckout?: boolean
}

export default function VisitorTable({ visitors, showCheckout }: VisitorTableProps) {
  const dispatch = useAppDispatch()

  const handleCheckout = async (visitorId: string) => {
    try {
      await dispatch(checkOutVisitor(visitorId)).unwrap()
      toast.success('Visitor checked out successfully')
    } catch (error) {
      toast.error('Failed to check out visitor')
    }
  }

  if (visitors.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No visitors found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Status</TableHead>
              {showCheckout && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitors.map((visitor) => (
              <TableRow key={visitor._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={visitor.photoUrl} alt={visitor.fullName || 'Visitor'} />
                      <AvatarFallback>
                        {visitor.fullName
                          ? visitor.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                          : 'V'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{visitor.fullName || 'N/A'}</div>
                      {visitor.company && (
                        <div className="text-sm text-muted-foreground">{visitor.company}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{visitor.email}</div>
                    <div className="text-muted-foreground">{visitor.phoneNumber}</div>
                  </div>
                </TableCell>
                <TableCell>{visitor.purpose}</TableCell>
                <TableCell>{visitor.hostEmployeeName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {visitor.checkInTime && !isNaN(new Date(visitor.checkInTime).getTime()) ? (
                      <>
                        {format(new Date(visitor.checkInTime), 'MMM dd, yyyy')}
                        <div className="text-muted-foreground">
                          {format(new Date(visitor.checkInTime), 'hh:mm a')}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={visitor.status === 'checked-in' ? 'default' : 'secondary'}>
                    {visitor.status === 'checked-in' ? 'Active' : 'Checked Out'}
                  </Badge>
                </TableCell>
                {showCheckout && (
                  <TableCell>
                    {visitor.status === 'checked-in' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckout(visitor._id)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Check Out
                      </Button>
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
