'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchVisitors, fetchActiveVisitors, fetchVisitorStats } from '@/lib/features/visitors/visitorSlice'
import { fetchRequests } from '@/lib/features/requests/requestSlice'
import { fetchNotifications } from '@/lib/features/notifications/notificationSlice'
import DashboardLayout from '@/components/layout/dashboard-layout'
import StatsCards from '@/components/dashboard/stats-cards'
import VisitorTable from '@/components/dashboard/visitor-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RequestsTable from '@/components/dashboard/requests-table'

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { visitors, activeVisitors, stats } = useAppSelector((state) => state.visitors)
  const { requests } = useAppSelector((state) => state.requests)

  useEffect(() => {
    dispatch(fetchVisitors())
    dispatch(fetchActiveVisitors())
    dispatch(fetchVisitorStats())
    dispatch(fetchRequests())
    dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {'Manage visitors, approvals, and system overview'}
          </p>
        </div>

        <StatsCards stats={stats} />

        <Tabs defaultValue="visitors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visitors">All Visitors</TabsTrigger>
            <TabsTrigger value="active">Active Visitors</TabsTrigger>
            <TabsTrigger value="requests">Visit Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="visitors" className="space-y-4">
            <VisitorTable visitors={visitors} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <VisitorTable visitors={activeVisitors} />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <RequestsTable requests={requests} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
