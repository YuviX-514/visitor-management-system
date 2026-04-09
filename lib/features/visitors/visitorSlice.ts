import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Visitor {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  company?: string
  purpose: string
  hostEmployeeId: string
  hostEmployeeName: string
  photoUrl: string
  checkInTime: string
  checkOutTime?: string
  status: 'checked-in' | 'checked-out'
  qrCode?: string
  idProof?: string
  createdAt: string
}

interface VisitorState {
  visitors: Visitor[]
  activeVisitors: Visitor[]
  currentVisitor: Visitor | null
  loading: boolean
  error: string | null
  stats: {
    total: number
    active: number
    today: number
  }
}

const initialState: VisitorState = {
  visitors: [],
  activeVisitors: [],
  currentVisitor: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    active: 0,
    today: 0,
  },
}

export const fetchVisitors = createAsyncThunk(
  'visitors/fetchVisitors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/visitors', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to fetch visitors')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to fetch visitors')
    }
  }
)

export const fetchActiveVisitors = createAsyncThunk(
  'visitors/fetchActiveVisitors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/visitors/active', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to fetch active visitors')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to fetch active visitors')
    }
  }
)

export const checkInVisitor = createAsyncThunk(
  'visitors/checkInVisitor',
  async (visitorData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/visitors/checkin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: visitorData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message)
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to check in visitor')
    }
  }
)

export const checkOutVisitor = createAsyncThunk(
  'visitors/checkOutVisitor',
  async (visitorId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/visitors/${visitorId}/checkout`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to check out visitor')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to check out visitor')
    }
  }
)

export const fetchVisitorStats = createAsyncThunk(
  'visitors/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/visitors/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to fetch stats')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to fetch stats')
    }
  }
)

const visitorSlice = createSlice({
  name: 'visitors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentVisitor: (state, action) => {
      state.currentVisitor = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Visitors
      .addCase(fetchVisitors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.loading = false
        state.visitors = action.payload
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Active Visitors
      .addCase(fetchActiveVisitors.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchActiveVisitors.fulfilled, (state, action) => {
        state.loading = false
        state.activeVisitors = action.payload
      })
      .addCase(fetchActiveVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Check In Visitor
      .addCase(checkInVisitor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkInVisitor.fulfilled, (state, action) => {
        state.loading = false
        state.visitors.unshift(action.payload)
        state.activeVisitors.unshift(action.payload)
      })
      .addCase(checkInVisitor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Check Out Visitor
      .addCase(checkOutVisitor.pending, (state) => {
        state.loading = true
      })
      .addCase(checkOutVisitor.fulfilled, (state, action) => {
        state.loading = false
        state.activeVisitors = state.activeVisitors.filter(v => v._id !== action.payload._id)
        const index = state.visitors.findIndex(v => v._id === action.payload._id)
        if (index !== -1) {
          state.visitors[index] = action.payload
        }
      })
      .addCase(checkOutVisitor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Stats
      .addCase(fetchVisitorStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  },
})

export const { clearError, setCurrentVisitor } = visitorSlice.actions
export default visitorSlice.reducer
