'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchActiveVisitors, fetchVisitors } from '@/lib/features/visitors/visitorSlice'
import { fetchRequests } from '@/lib/features/requests/requestSlice'
import DashboardLayout from '@/components/layout/dashboard-layout'
import VisitorTable from '@/components/dashboard/visitor-table'
import CheckInDialog from '@/components/dashboard/checkin-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Users } from 'lucide-react'

export default function SecurityDashboard() {
  const dispatch = useAppDispatch()
  const { visitors, activeVisitors } = useAppSelector((state) => state.visitors)
  const [showCheckIn, setShowCheckIn] = useState(false)

  useEffect(() => {
    dispatch(fetchVisitors())
    dispatch(fetchActiveVisitors())
    dispatch(fetchRequests())
    
    // Poll for active visitors every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchActiveVisitors())
      dispatch(fetchRequests())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleCheckinSuccess = () => {
    // Refresh all data after successful check-in
    dispatch(fetchVisitors())
    dispatch(fetchActiveVisitors())
    dispatch(fetchRequests())
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p className="text-muted-foreground">
              {'Check-in visitors and monitor active entries'}
            </p>
          </div>
          <Button onClick={() => setShowCheckIn(true)} size="lg">
            <UserPlus className="mr-2 h-5 w-5" />
            Check In Visitor
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVisitors.length}</div>
              <p className="text-xs text-muted-foreground">
                {'Currently on premises'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visitors.filter(v => {
                  const today = new Date()
                  const checkIn = new Date(v.checkInTime)
                  return checkIn.toDateString() === today.toDateString()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {'Visitors checked in today'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active Visitors
              <Badge variant="secondary" className="ml-2">
                {activeVisitors.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all">All Visitors</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <VisitorTable visitors={activeVisitors} showCheckout />
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <VisitorTable visitors={visitors} />
          </TabsContent>
        </Tabs>

        <CheckInDialog 
          open={showCheckIn} 
          onOpenChange={setShowCheckIn}
          onSuccess={handleCheckinSuccess}
        />
      </div>
    </DashboardLayout>
  )
}
