'use client'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { markAsRead, markAllAsRead } from '@/lib/features/notifications/notificationSlice'
import { approveRequest, rejectRequest, fetchRequests } from '@/lib/features/requests/requestSlice'
import { fetchVisitors, fetchActiveVisitors } from '@/lib/features/visitors/visitorSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useState } from 'react'

export default function NotificationsDropdown() {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleApprove = async (notification: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.relatedId) return
    setActionLoading(`approve-${notification._id}`)
    try {
      await dispatch(approveRequest(notification.relatedId)).unwrap()
      dispatch(markAsRead(notification._id))
      dispatch(fetchRequests())
      dispatch(fetchVisitors())
      dispatch(fetchActiveVisitors())
      toast.success('Visitor approved and checked in')
    } catch {
      toast.error('Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeny = async (notification: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.relatedId) return
    setActionLoading(`deny-${notification._id}`)
    try {
      await dispatch(rejectRequest(notification.relatedId)).unwrap()
      dispatch(markAsRead(notification._id))
      dispatch(fetchRequests())
      toast.success('Visitor request denied. You have 10 minutes to reverse this.')
    } catch {
      toast.error('Failed to deny request')
    } finally {
      setActionLoading(null)
    }
  }

  const isUnread = (n: any) => !(n.isRead || n.read)
  const isRequestType = (n: any) => n.type === 'request' || n.type === 'visit_request'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[500px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-3 py-3 border-b last:border-0 ${
                    isUnread(notification) ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onClick={() => isUnread(notification) && handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm">{notification.title}</span>
                    {isUnread(notification) && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {notification.createdAt && !isNaN(new Date(notification.createdAt).getTime())
                      ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                      : 'Just now'}
                  </p>

                  {/* Approve / Deny buttons for pending visitor requests */}
                  {isRequestType(notification) && isUnread(notification) && notification.relatedId && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-7 gap-1 bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
                        disabled={!!actionLoading}
                        onClick={(e) => handleApprove(notification, e)}
                      >
                        <Check className="h-3 w-3" />
                        {actionLoading === `approve-${notification._id}` ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 gap-1 text-xs flex-1"
                        disabled={!!actionLoading}
                        onClick={(e) => handleDeny(notification, e)}
                      >
                        <X className="h-3 w-3" />
                        {actionLoading === `deny-${notification._id}` ? 'Denying...' : 'Deny'}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
