import mongoose, { Schema, Document } from 'mongoose'

export interface IVisitRequest extends Document {
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitorCompany?: string
  purpose: string
  requestedDate: Date
  requestedTime: string
  hostEmployeeId: mongoose.Types.ObjectId
  hostEmployeeName: string
  hostEmployeeEmail: string
  status: 'pending' | 'approved' | 'rejected'
  qrCode?: string
  approvedAt?: Date
  rejectedAt?: Date
  rejectedReason?: string
  canReverse: boolean
  reversalDeadline?: Date
  isPreApproval: boolean
  emailSent: boolean
  notificationSent: boolean
  expiresAt: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const VisitRequestSchema = new Schema<IVisitRequest>(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
    },
    visitorEmail: {
      type: String,
      required: [true, 'Visitor email is required'],
      lowercase: true,
      trim: true,
    },
    visitorPhone: {
      type: String,
      required: [true, 'Visitor phone is required'],
      trim: true,
    },
    visitorCompany: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    requestedDate: {
      type: Date,
      required: [true, 'Requested date is required'],
    },
    requestedTime: {
      type: String,
      required: [true, 'Requested time is required'],
    },
    hostEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host employee is required'],
    },
    hostEmployeeName: {
      type: String,
      required: true,
    },
    hostEmployeeEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    qrCode: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectedReason: {
      type: String,
    },
    canReverse: {
      type: Boolean,
      default: true,
    },
    reversalDeadline: {
      type: Date,
    },
    isPreApproval: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: String,
      enum: ['security', 'employee', 'admin'],
      default: 'security',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.VisitRequest || mongoose.model<IVisitRequest>('VisitRequest', VisitRequestSchema)
