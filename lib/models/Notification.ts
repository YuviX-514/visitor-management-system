import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: 'visit_request' | 'approval' | 'rejection' | 'checkin' | 'checkout' | 'request'
  title: string
  message: string
  isRead: boolean
  read: boolean
  relatedId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['visit_request', 'approval', 'rejection', 'checkin', 'checkout', 'request'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
