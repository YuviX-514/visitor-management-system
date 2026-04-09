'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QrCode, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export function QRScanner() {
  const [qrData, setQrData] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)

  const handleScan = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data')
      return
    }

    setScanning(true)

    try {
      const response = await fetch('/api/visitors/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'QR scan failed')
        return
      }

      setResult(data)
      setShowResult(true)
      
      if (data.action === 'checkin') {
        toast.success('Visitor checked in successfully!')
      } else {
        toast.success('Visitor checked out successfully!')
      }

      setQrData('')
    } catch (error) {
      console.error('QR scan error:', error)
      toast.error('Failed to scan QR code')
    } finally {
      setScanning(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan visitor QR codes for check-in or check-out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter or scan QR code data..."
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleScan()
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleScan} 
              disabled={scanning || !qrData.trim()}
            >
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Ask visitor to show their QR code (from email)</li>
              <li>Scan using QR scanner or manually enter code</li>
              <li>System automatically checks in or checks out</li>
              <li>Confirmation shown on screen</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result?.action === 'checkin' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Visitor Checked In
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Visitor Checked Out
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {result?.message}
            </DialogDescription>
          </DialogHeader>

          {result?.visitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{result.visitor.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{result.visitor.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{result.visitor.phoneNumber}</p>
                </div>
                {result.visitor.company && (
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{result.visitor.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Meeting With</p>
                  <p className="font-medium">{result.visitor.hostEmployeeName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purpose</p>
                  <p className="font-medium">{result.visitor.purpose}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Check-in Time:</span>
                  <span className="font-medium">
                    {formatTime(result.visitor.checkInTime)}
                  </span>
                </div>

                {result.action === 'checkout' && result.visitor.checkOutTime && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Check-out Time:</span>
                      <span className="font-medium">
                        {formatTime(result.visitor.checkOutTime)}
                      </span>
                    </div>
                    {result.visitor.visitDuration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Visit Duration:</span>
                        <span className="font-medium">{result.visitor.visitDuration}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button 
                onClick={() => setShowResult(false)} 
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
