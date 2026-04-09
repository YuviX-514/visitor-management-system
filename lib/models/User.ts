import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  fullName: string
  name: string
  employeeId: string
  role: 'admin' | 'employee' | 'security'
  department?: string
  phoneNumber?: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    role: {
      type: String,
      enum: ['admin', 'employee', 'security'],
      required: [true, 'Role is required'],
    },
    department: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Auto-generate employee ID before saving
UserSchema.pre('save', async function (next) {
  if (this.isNew && (this.role === 'employee' || this.role === 'admin')) {
    if (!this.employeeId) {
      // Find the last employee ID
      const lastUser = await mongoose.models.User.findOne(
        { employeeId: { $exists: true, $ne: null } },
        { employeeId: 1 }
      ).sort({ employeeId: -1 })

      let nextNumber = 1
      if (lastUser?.employeeId) {
        const match = lastUser.employeeId.match(/EMP(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1
        }
      }

      this.employeeId = `EMP${String(nextNumber).padStart(4, '0')}`
    }
  }
  next()
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
