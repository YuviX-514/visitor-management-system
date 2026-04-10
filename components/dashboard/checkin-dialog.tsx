'use client'

import { useState, useRef } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { checkInVisitor } from '@/lib/features/visitors/visitorSlice'
import { fetchRequests } from '@/lib/features/requests/requestSlice'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import EmployeeAutocomplete from './employee-autocomplete'

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function CheckInDialog({ open, onOpenChange, onSuccess }: CheckInDialogProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    company: '',
    purpose: '',
    hostEmployeeId: '',
    hostEmployeeName: '',
    hostEmployeeEmail: '',
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleEmployeeSelect = (employee: any) => {
    setFormData({
      ...formData,
      hostEmployeeId: employee._id,
      hostEmployeeName: employee.fullName || employee.name,
      hostEmployeeEmail: employee.email,
    })
  }

  const resetForm = () => {
    setFormData({
      fullName: '', email: '', phoneNumber: '', company: '',
      purpose: '', hostEmployeeId: '', hostEmployeeName: '', hostEmployeeEmail: '',
    })
    setPhoto(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!photo) {
      toast.error('Visitor photo is mandatory')
      return
    }
    if (!formData.hostEmployeeId) {
      toast.error('Please select a host employee')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('fullName', formData.fullName)
      fd.append('email', formData.email)
      fd.append('phoneNumber', formData.phoneNumber)
      fd.append('company', formData.company)
      fd.append('purpose', formData.purpose)
      fd.append('hostEmployeeId', formData.hostEmployeeId)
      fd.append('hostEmployeeName', formData.hostEmployeeName)
      fd.append('hostEmployeeEmail', formData.hostEmployeeEmail)
      fd.append('photo', photo)

      await dispatch(checkInVisitor(fd)).unwrap()
      toast.success('Approval request sent to host employee')
      dispatch(fetchRequests())
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err || 'Failed to submit visitor request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Visitor</DialogTitle>
          <DialogDescription>
            Fill in visitor details. An approval request will be sent to the host employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="space-y-2">
            <Label>
              Visitor Photo <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover border"
                />
              )}
              <div>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {photo ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                {!photo && <p className="text-xs text-muted-foreground mt-1">Required for check-in</p>}
              </div>
            </div>
          </div>

          {/* Visitor details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="fullName" required placeholder="John Doe" value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" required placeholder="visitor@example.com" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Input id="phone" type="tel" required placeholder="+91 98765 43210" value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Company Name" value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
          </div>

          {/* Host Employee */}
          <div className="space-y-2">
            <Label>Host Employee <span className="text-destructive">*</span></Label>
            <EmployeeAutocomplete
              value={formData.hostEmployeeName}
              onSelect={handleEmployeeSelect}
              placeholder="Search by name, Employee ID, or department..."
            />
            {formData.hostEmployeeName && (
              <p className="text-xs text-green-600 font-medium">Selected: {formData.hostEmployeeName}</p>
            )}
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Visit <span className="text-destructive">*</span></Label>
            <Textarea id="purpose" required rows={2} placeholder="Meeting, Interview, Delivery, etc."
              value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !photo || !formData.hostEmployeeId}>
              {loading ? 'Sending Request...' : 'Send Approval Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
