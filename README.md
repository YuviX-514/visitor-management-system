# Visitor Management System (VMS)

A comprehensive full-stack Visitor Management System built with the MERN stack, TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **JWT-based Authentication** with role-based access control (Admin, Employee, Security Guard)
- **Visitor Registration** with mandatory photo capture
- **Approval Workflow** for visitor requests
- **Pre-Approval System** with QR code generation
- **Check-in/Check-out Tracking** with timestamps
- **Real-time Notifications** for approvals and visitor activities
- **Role-specific Dashboards** with analytics

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **QR Code**: qrcode library

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
│   │   │   ├── checkin/route.ts
│   │   │   └── [id]/checkout/route.ts
│   │   ├── requests/
│   │   │   ├── route.ts
│   │   │   ├── pre-approval/route.ts
│   │   │   └── [id]/
│   │   │       ├── approve/route.ts
│   │   │       └── reject/route.ts
│   │   └── notifications/route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
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
│   ├── layout/
│   │   └── dashboard-layout.tsx
│   ├── providers/
│   │   └── redux-provider.tsx
│   └── ui/ (shadcn components)
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
│   ├── store.ts
│   ├── hooks.ts
│   ├── mongodb.ts
│   ├── auth.ts
│   └── utils.ts
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- npm or pnpm package manager

### Step 1: Clone or Download
Download the ZIP file and extract it to your desired location.

### Step 2: Install Dependencies
```bash
pnpm install
# or
npm install
```

### Step 3: Environment Variables
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/visitor-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 4: Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### Step 5: Run Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Visitors
- `GET /api/visitors` - Get all visitors (filtered by role)
- `GET /api/visitors/active` - Get active visitors
- `GET /api/visitors/stats` - Get visitor statistics
- `POST /api/visitors/checkin` - Check in a visitor
- `PATCH /api/visitors/[id]/checkout` - Check out a visitor

### Visit Requests
- `GET /api/requests` - Get all visit requests
- `GET /api/requests/pending` - Get pending requests
- `POST /api/requests/pre-approval` - Create pre-approved visit
- `PATCH /api/requests/[id]/approve` - Approve request
- `PATCH /api/requests/[id]/reject` - Reject request

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

## 🎯 User Roles & Permissions

### Admin
- View all visitors and statistics
- Access to all visit requests
- Full system oversight
- View all notifications

### Employee
- Pre-approve visitors
- Approve/reject visit requests
- View own visitors only
- Receive notifications for their visitors

### Security Guard
- Check-in visitors with photo capture
- Check-out visitors
- View active visitors
- Monitor visitor logs

## 🗄️ Database Models

### User
```typescript
{
  email: string
  password: string (hashed)
  name: string
  role: 'admin' | 'employee' | 'security'
  department?: string
  phoneNumber?: string
}
```

### Visitor
```typescript
{
  fullName: string
  email: string
  phoneNumber: string
  company?: string
  purpose: string
  hostEmployeeId: ObjectId
  hostEmployeeName: string
  photoUrl: string
  checkInTime: Date
  checkOutTime?: Date
  status: 'checked-in' | 'checked-out'
  qrCode?: string
}
```

### VisitRequest
```typescript
{
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitorCompany?: string
  purpose: string
  requestedDate: Date
  requestedTime: string
  hostEmployeeId: ObjectId
  hostEmployeeName: string
  status: 'pending' | 'approved' | 'rejected'
  qrCode?: string
  expiresAt: Date
}
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### MongoDB Atlas
1. Create a cluster on MongoDB Atlas
2. Get connection string
3. Update MONGODB_URI in environment variables

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Separate permissions per role
- **HTTP-only Cookies**: Secure session management
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Mongoose ODM with parameterized queries

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Built-in theme system
- **Real-time Updates**: Optimistic UI updates
- **Loading States**: Skeleton screens and spinners
- **Toast Notifications**: User-friendly feedback
- **Form Validation**: Client and server-side validation

## 🧪 Testing

The project is production-ready and interview-ready with:
- Clean code architecture
- Type safety with TypeScript
- Proper error handling
- Scalable folder structure
- Best practices implementation

## 📝 Future Enhancements

- Email notifications integration
- SMS notifications
- Visitor badge printing
- Advanced analytics dashboard
- Multi-language support
- Cloudinary integration for photo storage
- Redis caching for performance
- WebSocket for real-time updates

## 🤝 Contributing

This is a complete project template. Feel free to customize and extend it for your needs.

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 💡 Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Built with ❤️ using Next.js 16, Redux Toolkit, MongoDB, and TypeScript**
