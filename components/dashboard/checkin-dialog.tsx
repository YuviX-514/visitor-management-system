'use client'

import { useState, useRef } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { checkInVisitor } from '@/lib/features/visitors/visitorSlice'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Camera, Upload } from 'lucide-react'
import { toast } from 'sonner'
import EmployeeAutocomplete from './employee-autocomplete'

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CheckInDialog({ open, onOpenChange }: CheckInDialogProps) {
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
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEmployeeSelect = (employee: any) => {
    setFormData({
      ...formData,
      hostEmployeeId: employee._id,
      hostEmployeeName: employee.fullName,
      hostEmployeeEmail: employee.email,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!photo) {
      toast.error('Visitor photo is mandatory. Please upload a photo.')
      return
    }

    if (!formData.hostEmployeeId) {
      toast.error('Please select the host employee')
      return
    }

    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phoneNumber', formData.phoneNumber)
      formDataToSend.append('company', formData.company)
      formDataToSend.append('purpose', formData.purpose)
      formDataToSend.append('hostEmployeeId', formData.hostEmployeeId)
      formDataToSend.append('hostEmployeeName', formData.hostEmployeeName)
      formDataToSend.append('hostEmployeeEmail', formData.hostEmployeeEmail)
      formDataToSend.append('photo', photo)

      await dispatch(checkInVisitor(formDataToSend)).unwrap()
      toast.success('Visitor checked in successfully')
      onOpenChange(false)
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        company: '',
        purpose: '',
        hostEmployeeId: '',
        hostEmployeeName: '',
        hostEmployeeEmail: '',
      })
      setPhoto(null)
      setPreviewUrl(null)
    } catch (error) {
      toast.error('Failed to check in visitor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visitor Check-In</DialogTitle>
          <DialogDescription>
            Register a new visitor. Photo is mandatory for all visitors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visitor Photo - MANDATORY */}
          <FieldGroup>
            <FieldLabel>
              Visitor Photo <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="flex flex-col gap-4">
              {previewUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary">
                  <img
                    src={previewUrl}
                    alt="Visitor preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {photo ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              {!photo && (
                <p className="text-xs text-muted-foreground">
                  Photo is required for visitor check-in
                </p>
              )}
            </div>
          </FieldGroup>

          {/* Visitor Information */}
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <FieldLabel htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Field>
                <InputGroup>
                  <InputGroupInput
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Field>
                <InputGroup>
                  <InputGroupInput
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="visitor@example.com"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </FieldLabel>
              <Field>
                <InputGroup>
                  <InputGroupInput
                    id="phone"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="+1 234 567 8900"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <Field>
                <InputGroup>
                  <InputGroupInput
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Company Name"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>

          {/* Host Employee Search with Autocomplete */}
          <FieldGroup>
            <FieldLabel>
              Host Employee <span className="text-destructive">*</span>
            </FieldLabel>
            <EmployeeAutocomplete
              value={formData.hostEmployeeName}
              onSelect={handleEmployeeSelect}
              placeholder="Search by name, Employee ID, or department..."
            />
            {formData.hostEmployeeName && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected: <strong>{formData.hostEmployeeName}</strong>
              </p>
            )}
          </FieldGroup>

          {/* Purpose */}
          <FieldGroup>
            <FieldLabel htmlFor="purpose">
              Purpose of Visit <span className="text-destructive">*</span>
            </FieldLabel>
            <Field>
              <Textarea
                id="purpose"
                required
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                placeholder="Meeting, Interview, Delivery, etc."
                rows={3}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !photo}>
              {loading ? 'Checking In...' : 'Check In Visitor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
