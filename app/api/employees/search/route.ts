import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ employees: [] })
    }

    // Search by name, employeeId, department, or email
    const employees = await User.find({
      role: { $in: ['employee', 'admin'] },
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('fullName name employeeId email department phoneNumber photoUrl role')
      .limit(20)
      .lean()

    // Format response with clear identification
    const formattedEmployees = employees.map((emp: any) => ({
      _id: emp._id,
      fullName: emp.fullName || emp.name,
      name: emp.name,
      employeeId: emp.employeeId,
      email: emp.email,
      department: emp.department || 'N/A',
      phoneNumber: emp.phoneNumber || 'N/A',
      photoUrl: emp.photoUrl,
      role: emp.role,
      displayText: `${emp.fullName || emp.name} (${emp.employeeId}) - ${emp.department || 'N/A'}`,
    }))

    return NextResponse.json({ employees: formattedEmployees })
  } catch (error) {
    console.error('Employee search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
