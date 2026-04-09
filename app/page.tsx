'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Shield, Users, QrCode, Bell, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const features = [
    {
      icon: Users,
      title: 'Visitor Registration',
      description: 'Quick and secure visitor check-in with photo capture and digital badges',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Separate dashboards for admins, employees, and security guards',
    },
    {
      icon: QrCode,
      title: 'QR Code System',
      description: 'Generate QR codes for pre-approved visitors for fast check-in',
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Get instant notifications for visitor requests and approvals',
    },
    {
      icon: CheckCircle,
      title: 'Approval Workflow',
      description: 'Employees can approve or reject visitor requests with one click',
    },
    {
      icon: Building2,
      title: 'Complete Audit Trail',
      description: 'Track all visitor activities with detailed logs and analytics',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">VMS</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-balance">
            Professional Visitor Management System
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
            Streamline your visitor management with our comprehensive MERN stack solution.
            Secure, efficient, and easy to use.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 rounded-full bg-blue-100 w-fit mb-2">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of organizations using our visitor management system
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Create Account Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Visitor Management System. Built with Next.js, Redux, and MongoDB.</p>
        </div>
      </footer>
    </div>
  )
}
