import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { markAsRead, markAllAsRead } from '@/lib/features/notifications/notificationSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsDropdown() {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications)

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

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
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="font-medium text-sm">{notification.title}</div>
                  {!notification.read && (
                    <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{notification.message}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
