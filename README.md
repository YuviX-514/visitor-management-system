# Visitor Management System (VMS)

A comprehensive, production-ready full-stack Visitor Management System with real-time email notifications, QR code-based check-in/check-out, and complete audit trails.

## 🎯 Key Features

### Email & Notifications
- **Real Email Validation** - Blocks fake/disposable emails
- **Instant Email Notifications** - Security sends request, employee receives email immediately
- **Dual Notification System** - Both email and in-app notifications
- **QR Code Delivery** - Approved visitors receive QR codes via email
- **Checkout Notifications** - Employees notified via email when visitors leave

### Approval Workflow
- **Real-time Requests** - Security creates requests, employees notified instantly
- **Email Approval Links** - Approve/deny directly from email
- **10-Minute Reversal Window** - Denied requests can be reversed within 10 minutes
- **QR Code Generation** - Automatic QR code creation on approval

### Pre-Approval System
- **Employee Pre-Registration** - Employees can pre-approve visitors
- **8-Hour Expiration** - Pre-approvals expire 8 hours after scheduled time
- **QR Code Email** - Pre-approved visitors receive QR code in advance
- **Fast Check-in** - Pre-approved visitors scan QR for instant check-in

### Check-in/Check-out
- **QR Code Scanning** - Single QR code for both check-in and check-out
- **Automatic Duration Tracking** - System calculates visit duration
- **Checkout Emails** - Employees receive visit summary on checkout
- **Complete Audit Trail** - All entry/exit times recorded in database

### Admin Features
- **Visitor History** - Complete searchable history of all visitors
- **Advanced Filtering** - Filter by date, status, name, company
- **Statistics Dashboard** - Real-time visitor analytics
- **Export Capabilities** - Download visitor records

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** (App Router with React 19)
- **TypeScript** - Full type safety
- **Redux Toolkit** - Centralized state management
- **Tailwind CSS** - Modern styling
- **shadcn/ui** - Premium components

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB + Mongoose** - NoSQL database
- **JWT Authentication** - Secure token-based auth
- **Nodemailer** - Email delivery
- **bcryptjs** - Password hashing

### Features
- **QR Code Generation** - qrcode library
- **Email Validation** - Real email verification
- **Cron Jobs** - Automatic expiration handling
- **Real-time Updates** - Redux-powered state sync

## 📁 Project Structure

```
visitor-management-system/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── signup/route.ts
│   │   │   └── verify/route.ts
│   │   ├── visitors/
│   │   │   ├── route.ts
│   │   │   ├── active/route.ts
│   │   │   ├── stats/route.ts
│   │   │   ├── history/route.ts          # Admin visitor history
│   │   │   ├── checkin/route.ts
│   │   │   ├── scan-qr/route.ts          # QR code scanning
│   │   │   └── [id]/checkout/route.ts
│   │   ├── requests/
│   │   │   ├── route.ts
│   │   │   ├── pre-approval/route.ts
│   │   │   └── [id]/
│   │   │       ├── approve/route.ts
│   │   │       ├── reject/route.ts
│   │   │       └── reverse/route.ts      # Reverse rejection
│   │   ├── notifications/route.ts
│   │   └── cron/
│   │       └── expire-requests/route.ts   # Auto-expire pre-approvals
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── page.tsx
├── components/
│   ├── dashboards/
│   │   ├── admin-dashboard.tsx
│   │   ├── employee-dashboard.tsx
│   │   └── security-dashboard.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── visitor-table.tsx
│   │   ├── requests-table.tsx
│   │   ├── notifications-dropdown.tsx
│   │   ├── checkin-dialog.tsx
│   │   └── pre-approval-dialog.tsx
│   └── providers/
│       └── redux-provider.tsx
├── lib/
│   ├── features/
│   │   ├── auth/authSlice.ts
│   │   ├── visitors/visitorSlice.ts
│   │   ├── requests/requestSlice.ts
│   │   └── notifications/notificationSlice.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Visitor.ts
│   │   ├── VisitRequest.ts
│   │   └── Notification.ts
│   ├── store.ts                          # Redux store
│   ├── hooks.ts                          # Redux hooks
│   ├── mongodb.ts                        # Database connection
│   ├── auth.ts                           # JWT utilities
│   └── email.ts                          # Email service
├── vercel.json                           # Cron configuration
└── .env.example

```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js 18+** installed
- **MongoDB** (local or Atlas cloud)
- **Gmail Account** or SMTP server for emails

### Step 1: Clone/Download the Project
```bash
# Download ZIP from v0 or clone from GitHub
cd visitor-management-system
```

### Step 2: Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### Step 3: Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/visitor-management
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/visitor-management

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-please-change-this

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@visitormanagement.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (for scheduled tasks)
CRON_SECRET=your-cron-secret-random-string
```

### Step 4: Gmail SMTP Setup (Recommended)

1. Go to your Google Account settings
2. Enable **2-Factor Authentication**
3. Generate an **App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
4. Use this password in `SMTP_PASS`

### Step 5: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
sudo apt install mongodb        # Ubuntu

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `.env.local` as `MONGODB_URI`

### Step 6: Run Development Server
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit **http://localhost:3000**

## 🚀 Usage Guide

### Initial Setup

1. **Create Admin Account**
   - Go to `/signup`
   - Register with role: "Admin"
   - Use a real email address

2. **Create Test Accounts**
   - Employee account (role: Employee)
   - Security account (role: Security Guard)

### Security Guard Workflow

1. **Visitor Arrives**
   - Click "Check-in Visitor"
   - Enter visitor details (name, email, phone, purpose)
   - Select host employee
   - Submit request

2. **Email Sent Automatically**
   - Host employee receives email with approval links
   - In-app notification also created

3. **Wait for Approval**
   - Employee approves via email or dashboard
   - Visitor receives QR code via email

4. **Scan QR Code**
   - Visitor shows QR code
   - Security scans for check-in
   - Same QR code used for check-out

### Employee Workflow

1. **Receive Request**
   - Email notification arrives instantly
   - Dashboard shows pending requests

2. **Approve/Deny**
   - Click approve in email or dashboard
   - Visitor receives QR code immediately
   
3. **Deny with Reversal**
   - If denied, 10-minute window to reverse
   - Click "Reverse Denial" to approve

4. **Pre-Approve Visitors**
   - Create pre-approval for scheduled visits
   - Visitor receives QR code in advance
   - Valid for 8 hours after scheduled time

5. **Checkout Notification**
   - Receive email when visitor leaves
   - Shows visit duration

### Admin Workflow

1. **View History**
   - Access complete visitor history
   - Filter by date, status, name, company
   - Export records

2. **Analytics**
   - View real-time statistics
   - Monitor active visitors
   - Track daily/weekly trends

## 📧 Email Templates

The system includes professional HTML email templates:

1. **Visitor Request** - Employee notification with approve/deny buttons
2. **Approval with QR** - Visitor receives QR code for entry
3. **Pre-Approval** - Pre-registered visitor receives QR code
4. **Denial Notice** - Visitor informed of rejection
5. **Checkout Summary** - Employee receives visit summary

## 🔐 Security Features

- **Email Validation** - Blocks disposable/fake emails
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Role-Based Access** - Granular permissions
- **HTTPS Required** - Production SSL enforcement
- **Cron Security** - Secret key verification

## 🔄 Automatic Expiration

The system includes a cron job that runs hourly to:
- Expire pre-approvals 8 hours after scheduled time
- Close reversal windows after 10 minutes
- Clean up stale requests

Configure in `vercel.json` or your hosting platform.

## 📊 Database Models

### User
- fullName, email, password (hashed)
- role: admin | employee | security
- department, phone

### Visitor
- fullName, email, phoneNumber, company
- hostEmployeeId, hostEmployeeName, hostEmployeeEmail
- checkInTime, checkOutTime, visitDuration
- status: checked-in | checked-out
- photoUrl, qrCode

### VisitRequest
- visitorName, visitorEmail, visitorPhone
- hostEmployeeId, hostEmployeeName, hostEmployeeEmail
- status: pending | approved | rejected
- isPreApproval, expiresAt
- canReverse, reversalDeadline
- qrCode, emailSent, notificationSent

### Notification
- userId, type, title, message
- relatedId, isRead
- createdAt

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables on Vercel
Add all variables from `.env.local` in:
- Project Settings → Environment Variables
- Add for Production, Preview, and Development

### MongoDB Atlas
- Use connection string in production
- Whitelist Vercel IPs or allow all (0.0.0.0/0)

## 🐛 Troubleshooting

### Emails Not Sending
- Check SMTP credentials
- Verify Gmail app password (not regular password)
- Check firewall/port 587

### QR Codes Not Working
- Ensure visitor email is valid
- Check approval status in database
- Verify QR data format

### Pre-Approvals Expiring Early
- Check timezone settings
- Verify cron job is running
- Check `expiresAt` calculation

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Visitors
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/active` - Get active visitors
- `GET /api/visitors/stats` - Get visitor statistics
- `GET /api/visitors/history` - Get visitor history (Admin only)
- `POST /api/visitors/checkin` - Create visitor request
- `POST /api/visitors/scan-qr` - Scan QR code (check-in/out)
- `PATCH /api/visitors/[id]/checkout` - Manual checkout

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests/pre-approval` - Create pre-approval
- `PATCH /api/requests/[id]/approve` - Approve request
- `PATCH /api/requests/[id]/reject` - Reject request
- `PATCH /api/requests/[id]/reverse` - Reverse rejection

### Notifications
- `GET /api/notifications` - Get user notifications

## 🤝 Contributing

This is a production-ready system. Feel free to customize:
- Add more roles
- Integrate with access control systems
- Add SMS notifications
- Implement visitor badging
- Add facial recognition

## 📄 License

MIT License - Feel free to use in your projects!

## 🙏 Credits

Built with Next.js 16, Redux Toolkit, MongoDB, and lots of coffee.

---

**Need Help?** Check the code comments or create an issue on GitHub.
