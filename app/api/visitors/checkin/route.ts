import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import VisitRequest from '@/lib/models/VisitRequest'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import { authenticateRequest } from '@/lib/auth'
import { validateEmail, sendVisitorRequestEmail } from '@/lib/email'
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
        { message: 'Only security guards and admins can create visitor requests' },
        { status: 403 }
      )
    }

    // Parse FormData (not JSON because of photo upload)
    const formData = await request.formData()
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const company = formData.get('company') as string
    const purpose = formData.get('purpose') as string
    const hostEmployeeId = formData.get('hostEmployeeId') as string
    const hostEmployeeName = formData.get('hostEmployeeName') as string
    const photo = formData.get('photo') as File

    if (!fullName || !email || !phoneNumber || !purpose || !hostEmployeeId || !hostEmployeeName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!photo) {
      return NextResponse.json(
        { message: 'Visitor photo is mandatory' },
        { status: 400 }
      )
    }

    // Convert photo to base64 for storage
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const photoBase64 = `data:${photo.type};base64,${buffer.toString('base64')}`

    // Validate email is real
    const isValidEmail = await validateEmail(email)
    if (!isValidEmail) {
      return NextResponse.json(
        { message: 'Please provide a valid and real email address. Disposable/fake emails are not allowed.' },
        { status: 400 }
      )
    }

    // Get host employee details
    const hostEmployee = await User.findById(hostEmployeeId)
    if (!hostEmployee) {
      return NextResponse.json(
        { message: 'Host employee not found' },
        { status: 404 }
      )
    }

    // Validate host employee email
    const isHostEmailValid = await validateEmail(hostEmployee.email)
    if (!isHostEmailValid) {
      return NextResponse.json(
        { message: 'Host employee has invalid email. Please contact admin.' },
        { status: 400 }
      )
    }

    // Generate QR code for visitor
    const qrCodeData = JSON.stringify({
      visitorName: fullName,
      visitorEmail: email,
      hostEmployee: hostEmployee.fullName,
      checkInTime: new Date().toISOString(),
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)

    // Create visitor record (immediate check-in, no approval needed for security desk check-ins)
    const visitor = await Visitor.create({
      fullName,
      email,
      phoneNumber,
      company,
      purpose,
      hostEmployeeId,
      hostEmployeeName: hostEmployee.fullName,
      hostEmployeeEmail: hostEmployee.email,
      photoUrl: photoBase64,
      checkInTime: new Date(),
      status: 'checked-in',
      qrCode,
      checkoutEmailSent: false,
    })

    // Send email notification to host employee about the visitor
    try {
      await sendVisitorRequestEmail(
        hostEmployee.email,
        hostEmployee.fullName,
        {
          name: fullName,
          email,
          phone: phoneNumber,
          purpose,
          company,
          requestId: visitor._id.toString(),
        }
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Continue even if email fails
    }

    // Create in-app notification
    try {
      await Notification.create({
        userId: hostEmployeeId,
        type: 'checkin',
        title: 'Visitor Checked In',
        message: `${fullName} has checked in and is here to see you. Purpose: ${purpose}`,
        relatedId: visitor._id,
        isRead: false,
      })
    } catch (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({
      message: 'Visitor checked in successfully',
      ...visitor.toObject(),
      _id: visitor._id.toString(),
    }, { status: 201 })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
