'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { verifyToken } from '@/lib/features/auth/authSlice'
import AdminDashboard from '@/components/dashboards/admin-dashboard'
import EmployeeDashboard from '@/components/dashboards/employee-dashboard'
import SecurityDashboard from '@/components/dashboards/security-dashboard'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(verifyToken())
    } else {
      router.push('/login')
    }
  }, [dispatch, router])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'employee' && <EmployeeDashboard />}
      {user.role === 'security' && <SecurityDashboard />}
    </>
  )
}
