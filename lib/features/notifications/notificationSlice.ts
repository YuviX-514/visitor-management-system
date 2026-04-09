import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  _id: string
  userId: string
  type: 'visit_request' | 'approval' | 'rejection' | 'checkin' | 'checkout' | 'request'
  title: string
  message: string
  isRead: boolean
  read?: boolean
  relatedId?: string
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to fetch notifications')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to mark as read')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to mark as read')
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to mark all as read')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to mark all as read')
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead && !action.payload.read) {
        state.unreadCount += 1
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg
        const index = state.notifications.findIndex(n => n._id === notificationId)
        if (index !== -1) {
          state.notifications[index].isRead = true
          state.notifications[index].read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      // Mark All As Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true, read: true }))
        state.unreadCount = 0
      })
  },
})

export const { addNotification, clearError } = notificationSlice.actions
export default notificationSlice.reducer
