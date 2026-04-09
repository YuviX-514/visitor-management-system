import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface VisitRequest {
  _id: string
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitorCompany?: string
  purpose: string
  requestedDate: string
  requestedTime: string
  hostEmployeeId: string
  hostEmployeeName: string
  status: 'pending' | 'approved' | 'rejected'
  qrCode?: string
  approvedAt?: string
  rejectedAt?: string
  expiresAt?: string
  createdAt: string
}

interface RequestState {
  requests: VisitRequest[]
  pendingRequests: VisitRequest[]
  currentRequest: VisitRequest | null
  loading: boolean
  error: string | null
}

const initialState: RequestState = {
  requests: [],
  pendingRequests: [],
  currentRequest: null,
  loading: false,
  error: null,
}

export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to fetch requests')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to fetch requests')
    }
  }
)

export const fetchPendingRequests = createAsyncThunk(
  'requests/fetchPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/requests/pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to fetch pending requests')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to fetch pending requests')
    }
  }
)

export const createPreApproval = createAsyncThunk(
  'requests/createPreApproval',
  async (requestData: {
    visitorName: string
    visitorEmail: string
    visitorPhone: string
    visitorCompany?: string
    purpose: string
    requestedDate: string
    requestedTime: string
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/requests/pre-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message)
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to create pre-approval')
    }
  }
)

export const approveRequest = createAsyncThunk(
  'requests/approveRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to approve request')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to approve request')
    }
  }
)

export const rejectRequest = createAsyncThunk(
  'requests/rejectRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error('Failed to reject request')
      return await response.json()
    } catch (error) {
      return rejectWithValue('Failed to reject request')
    }
  }
)

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Pending Requests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false
        state.pendingRequests = action.payload
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create Pre-Approval
      .addCase(createPreApproval.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPreApproval.fulfilled, (state, action) => {
        state.loading = false
        state.requests.unshift(action.payload)
      })
      .addCase(createPreApproval.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Approve Request
      .addCase(approveRequest.pending, (state) => {
        state.loading = true
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false
        state.pendingRequests = state.pendingRequests.filter(r => r._id !== action.payload._id)
        const index = state.requests.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Reject Request
      .addCase(rejectRequest.pending, (state) => {
        state.loading = true
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.loading = false
        state.pendingRequests = state.pendingRequests.filter(r => r._id !== action.payload._id)
        const index = state.requests.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentRequest } = requestSlice.actions
export default requestSlice.reducer
