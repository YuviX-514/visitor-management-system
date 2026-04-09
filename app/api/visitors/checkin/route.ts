import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (authData.role !== 'security' && authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only security guards and admins can check in visitors' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const company = formData.get('company') as string
    const purpose = formData.get('purpose') as string
    const hostEmployeeId = formData.get('hostEmployeeId') as string
    const hostEmployeeName = formData.get('hostEmployeeName') as string
    const photoFile = formData.get('photo') as File

    if (!fullName || !email || !phoneNumber || !purpose || !hostEmployeeId || !hostEmployeeName || !photoFile) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, upload photo to Cloudinary or S3
    // For demo, we'll use a placeholder
    const photoUrl = '/placeholder-user.jpg'

    const visitor = await Visitor.create({
      fullName,
      email,
      phoneNumber,
      company,
      purpose,
      hostEmployeeId,
      hostEmployeeName,
      photoUrl,
      checkInTime: new Date(),
      status: 'checked-in',
    })

    // Generate QR code
    const qrCodeData = JSON.stringify({
      visitorId: visitor._id,
      fullName: visitor.fullName,
      checkInTime: visitor.checkInTime,
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)
    visitor.qrCode = qrCode
    await visitor.save()

    // Create notification for host employee
    await Notification.create({
      userId: hostEmployeeId,
      type: 'checkin',
      title: 'Visitor Checked In',
      message: `${fullName} has checked in to see you`,
      relatedId: visitor._id,
    })

    return NextResponse.json(visitor, { status: 201 })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
