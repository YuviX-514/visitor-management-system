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

    // Create visit request (pending approval)
    const visitRequest = await VisitRequest.create({
      visitorName: fullName,
      visitorEmail: email,
      visitorPhone: phoneNumber,
      visitorCompany: company,
      purpose,
      requestedDate: new Date(),
      requestedTime: new Date().toLocaleTimeString(),
      hostEmployeeId,
      hostEmployeeName,
      hostEmployeeEmail: hostEmployee.email,
      status: 'pending',
      createdBy: 'security',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      emailSent: false,
      notificationSent: false,
    })

    // Send email notification to host employee
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
          requestId: visitRequest._id.toString(),
        }
      )
      visitRequest.emailSent = true
      await visitRequest.save()
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Continue even if email fails
    }

    // Create in-app notification
    try {
      await Notification.create({
        userId: hostEmployeeId,
        type: 'request',
        title: 'New Visitor Request',
        message: `${fullName} is requesting to visit you. Purpose: ${purpose}`,
        relatedId: visitRequest._id,
        isRead: false,
      })
      visitRequest.notificationSent = true
      await visitRequest.save()
    } catch (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({
      message: 'Visitor request sent to employee. Awaiting approval.',
      request: visitRequest,
    }, { status: 201 })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
