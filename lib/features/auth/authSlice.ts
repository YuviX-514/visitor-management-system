import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'admin' | 'employee' | 'security'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  phoneNumber?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message)
      }
      
      const data = await response.json()
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      return rejectWithValue('Login failed')
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: { email: string; password: string; name: string; role: UserRole; department?: string; phoneNumber?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message)
      }
      
      const data = await response.json()
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      return rejectWithValue('Signup failed')
    }
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return rejectWithValue('No token found')
      }
      
      const response = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        localStorage.removeItem('token')
        return rejectWithValue('Token verification failed')
      }
      
      const data = await response.json()
      return { user: data.user, token }
    } catch (error) {
      localStorage.removeItem('token')
      return rejectWithValue('Token verification failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.loading = true
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
