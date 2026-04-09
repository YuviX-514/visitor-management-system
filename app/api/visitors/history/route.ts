import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Visitor from '@/lib/models/Visitor'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const authData = await authenticateRequest(request)
    if (!authData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can view full history
    if (authData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can view visitor history' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') // 'checked-in' or 'checked-out'
    const search = searchParams.get('search') // Search by name, email, or company
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { hostEmployeeName: { $regex: search, $options: 'i' } },
      ]
    }

    if (startDate || endDate) {
      query.checkInTime = {}
      if (startDate) {
        query.checkInTime.$gte = new Date(startDate)
      }
      if (endDate) {
        query.checkInTime.$lte = new Date(endDate)
      }
    }

    // Get visitors with pagination
    const visitors = await Visitor.find(query)
      .sort({ checkInTime: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .populate('hostEmployeeId', 'fullName email')
      .lean()

    // Get total count for pagination
    const total = await Visitor.countDocuments(query)

    // Calculate statistics
    const stats = {
      totalVisitors: await Visitor.countDocuments(),
      activeVisitors: await Visitor.countDocuments({ status: 'checked-in' }),
      completedVisits: await Visitor.countDocuments({ status: 'checked-out' }),
      todayVisitors: await Visitor.countDocuments({
        checkInTime: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    }

    return NextResponse.json({
      visitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Visitor history error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
