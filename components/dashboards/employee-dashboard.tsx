'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchVisitors } from '@/lib/features/visitors/visitorSlice'
import { fetchRequests, fetchPendingRequests } from '@/lib/features/requests/requestSlice'
import { fetchNotifications } from '@/lib/features/notifications/notificationSlice'
import DashboardLayout from '@/components/layout/dashboard-layout'
import VisitorTable from '@/components/dashboard/visitor-table'
import RequestsTable from '@/components/dashboard/requests-table'
import PreApprovalDialog from '@/components/dashboard/pre-approval-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export default function EmployeeDashboard() {
  const dispatch = useAppDispatch()
  const { visitors } = useAppSelector((state) => state.visitors)
  const { requests, pendingRequests } = useAppSelector((state) => state.requests)
  const [showPreApproval, setShowPreApproval] = useState(false)

  useEffect(() => {
    dispatch(fetchVisitors())
    dispatch(fetchRequests())
    dispatch(fetchPendingRequests())
    dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <p className="text-muted-foreground">
              {'Manage your visitors and approval requests'}
            </p>
          </div>
          <Button onClick={() => setShowPreApproval(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Pre-Approve Visitor
          </Button>
        </div>

        {pendingRequests.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pending Approvals
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              </CardTitle>
              <CardDescription>
                {'You have pending visit requests that need your attention'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="visitors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visitors">My Visitors</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approvals
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="visitors" className="space-y-4">
            <VisitorTable visitors={visitors} />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <RequestsTable requests={pendingRequests} showActions />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <RequestsTable requests={requests} />
          </TabsContent>
        </Tabs>

        <PreApprovalDialog open={showPreApproval} onOpenChange={setShowPreApproval} />
      </div>
    </DashboardLayout>
  )
}
