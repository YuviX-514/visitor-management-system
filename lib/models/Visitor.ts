import mongoose, { Schema, Document } from 'mongoose'

export interface IVisitor extends Document {
  fullName: string
  email: string
  phoneNumber: string
  company?: string
  purpose: string
  hostEmployeeId: mongoose.Types.ObjectId
  hostEmployeeName: string
  hostEmployeeEmail: string
  photoUrl: string
  checkInTime: Date
  checkOutTime?: Date
  visitDuration?: string
  status: 'checked-in' | 'checked-out'
  qrCode?: string
  idProof?: string
  requestId?: mongoose.Types.ObjectId
  checkoutEmailSent: boolean
  checkedInBy: {
    userId: mongoose.Types.ObjectId
    name: string
    role: string
  }
  checkedOutBy?: {
    userId: mongoose.Types.ObjectId
    name: string
    role: string
  }
  createdAt: Date
  updatedAt: Date
}

const VisitorSchema = new Schema<IVisitor>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
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
    photoUrl: {
      type: String,
      required: [true, 'Photo is required'],
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    visitDuration: {
      type: String,
    },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out'],
      default: 'checked-in',
    },
    qrCode: {
      type: String,
    },
    idProof: {
      type: String,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'VisitRequest',
    },
    checkoutEmailSent: {
      type: Boolean,
      default: false,
    },
    checkedInBy: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
    },
    checkedOutBy: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
      },
      role: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema)
