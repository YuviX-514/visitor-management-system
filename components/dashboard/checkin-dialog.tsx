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
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

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
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!photo) {
      toast.error('Please capture visitor photo')
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
          <DialogTitle>Check In Visitor</DialogTitle>
          <DialogDescription>
            Register a new visitor and generate their access badge
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full Name *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone Number *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="hostEmployeeName">Host Employee Name *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="hostEmployeeName"
                    value={formData.hostEmployeeName}
                    onChange={(e) => setFormData({ ...formData, hostEmployeeName: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="hostEmployeeId">Host Employee ID *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="hostEmployeeId"
                    value={formData.hostEmployeeId}
                    onChange={(e) => setFormData({ ...formData, hostEmployeeId: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="purpose">Purpose of Visit *</FieldLabel>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                required
              />
            </Field>
          </FieldGroup>

          <div className="space-y-2">
            <FieldLabel>Visitor Photo *</FieldLabel>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Visitor preview"
                  className="h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Checking in...' : 'Check In Visitor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
