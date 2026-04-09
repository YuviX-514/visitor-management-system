'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Search, Download, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface HistoryVisitor {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  company?: string
  purpose: string
  hostEmployeeName: string
  photoUrl: string
  checkInTime: string
  checkOutTime?: string
  visitDuration?: string
  status: 'checked-in' | 'checked-out'
}

export default function HistoryPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [visitors, setVisitors] = useState<HistoryVisitor[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<HistoryVisitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'checked-out'>('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    filterVisitors()
  }, [searchQuery, dateFilter, statusFilter, visitors])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/visitors/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVisitors(data.visitors)
        setFilteredVisitors(data.visitors)
      }
    } catch (error) {
      console.error('Fetch history error:', error)
      toast.error('Failed to load visitor history')
    } finally {
      setLoading(false)
    }
  }

  const filterVisitors = () => {
    let filtered = [...visitors]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.fullName.toLowerCase().includes(query) ||
          v.email.toLowerCase().includes(query) ||
          v.company?.toLowerCase().includes(query) ||
          v.hostEmployeeName.toLowerCase().includes(query)
      )
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((v) => {
        if (!v.checkInTime || isNaN(new Date(v.checkInTime).getTime())) return false
        const checkInDate = format(new Date(v.checkInTime), 'yyyy-MM-dd')
        return checkInDate === dateFilter
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((v) => v.status === statusFilter)
    }

    setFilteredVisitors(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Purpose', 'Host', 'Check-In', 'Check-Out', 'Duration', 'Status']
    const rows = filteredVisitors.map((v) => [
      v.fullName,
      v.email,
      v.phoneNumber,
      v.company || 'N/A',
      v.purpose,
      v.hostEmployeeName,
      v.checkInTime && !isNaN(new Date(v.checkInTime).getTime()) 
        ? format(new Date(v.checkInTime), 'yyyy-MM-dd HH:mm') 
        : 'N/A',
      v.checkOutTime && !isNaN(new Date(v.checkOutTime).getTime())
        ? format(new Date(v.checkOutTime), 'yyyy-MM-dd HH:mm') 
        : 'N/A',
      v.visitDuration || 'N/A',
      v.status,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visitor-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    toast.success('History exported successfully')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Visitor History</h1>
          <p className="text-muted-foreground">Complete record of all visitor entries and exits</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <InputGroup>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <InputGroupInput
                    type="text"
                    placeholder="Search by name, email, company, or host..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </InputGroup>
              </div>
              <div>
                <InputGroup>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <InputGroupInput
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-9"
                  />
                </InputGroup>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="checked-in">Checked In</option>
                  <option value="checked-out">Checked Out</option>
                </select>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredVisitors.length} {filteredVisitors.length === 1 ? 'Visitor' : 'Visitors'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Loading...</div>
            ) : filteredVisitors.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No visitors found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => (
                      <TableRow key={visitor._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={visitor.photoUrl} alt={visitor.fullName} />
                              <AvatarFallback>
                                {visitor.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{visitor.fullName}</div>
                              {visitor.company && (
                                <div className="text-sm text-muted-foreground">{visitor.company}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{visitor.email}</div>
                            <div className="text-muted-foreground">{visitor.phoneNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={visitor.purpose}>
                            {visitor.purpose}
                          </div>
                        </TableCell>
                        <TableCell>{visitor.hostEmployeeName}</TableCell>
                        <TableCell>
                          {visitor.checkInTime && !isNaN(new Date(visitor.checkInTime).getTime()) ? (
                            <div className="text-sm">
                              <div>{format(new Date(visitor.checkInTime), 'MMM dd, yyyy')}</div>
                              <div className="text-muted-foreground">
                                {format(new Date(visitor.checkInTime), 'hh:mm a')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.checkOutTime && !isNaN(new Date(visitor.checkOutTime).getTime()) ? (
                            <div className="text-sm">
                              <div>{format(new Date(visitor.checkOutTime), 'MMM dd, yyyy')}</div>
                              <div className="text-muted-foreground">
                                {format(new Date(visitor.checkOutTime), 'hh:mm a')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.visitDuration || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={visitor.status === 'checked-in' ? 'default' : 'secondary'}>
                            {visitor.status === 'checked-in' ? 'Active' : 'Completed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
