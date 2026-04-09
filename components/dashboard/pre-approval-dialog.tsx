'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { createPreApproval } from '@/lib/features/requests/requestSlice'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PreApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PreApprovalDialog({ open, onOpenChange }: PreApprovalDialogProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    visitorCompany: '',
    purpose: '',
    requestedTime: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date) {
      toast.error('Please select a visit date')
      return
    }

    setLoading(true)
    
    try {
      await dispatch(createPreApproval({
        ...formData,
        requestedDate: date.toISOString(),
      })).unwrap()
      
      toast.success('Pre-approval created successfully')
      onOpenChange(false)
      
      // Reset form
      setFormData({
        visitorName: '',
        visitorEmail: '',
        visitorPhone: '',
        visitorCompany: '',
        purpose: '',
        requestedTime: '',
      })
      setDate(undefined)
    } catch (error) {
      toast.error('Failed to create pre-approval')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pre-Approve Visitor</DialogTitle>
          <DialogDescription>
            Create a pre-approved visit request with QR code for fast check-in
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="visitorName">Visitor Name *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="visitorName"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="visitorEmail">Visitor Email *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="visitorEmail"
                    type="email"
                    value={formData.visitorEmail}
                    onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="visitorPhone">Phone Number *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="visitorPhone"
                    value={formData.visitorPhone}
                    onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                    required
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="visitorCompany">Company</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="visitorCompany"
                    value={formData.visitorCompany}
                    onChange={(e) => setFormData({ ...formData, visitorCompany: e.target.value })}
                  />
                </InputGroup>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Visit Date *</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="requestedTime">Visit Time *</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="requestedTime"
                    type="time"
                    value={formData.requestedTime}
                    onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Pre-Approval'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
