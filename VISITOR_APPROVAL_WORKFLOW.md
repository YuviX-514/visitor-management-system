# Visitor Approval Workflow - FIXED

## The Problem (BEFORE)
Security guard checks in visitor → Visitor immediately marked as "Active/Checked-In" → Host just gets notification that someone is already here

## The Solution (NOW)

### Step 1: Security Guard Creates Request
**Action:** Security guard fills out check-in form with:
- Visitor details (name, email, phone, company, purpose)
- **Mandatory photo upload**
- Host employee selection (searchable autocomplete)

**Result:** Creates a **VisitRequest** with status: `pending`

**Notifications:**
- ✅ Host receives **EMAIL** with approval/denial buttons
- ✅ Host receives **IN-APP NOTIFICATION** asking for approval

---

### Step 2: Host Reviews Request
**Host sees:**
- Visitor photo
- All visitor details
- Purpose of visit
- Who created the request (security guard/admin name)

**Host can:**
1. **APPROVE** - Creates actual Visitor record, status becomes "checked-in"
2. **DENY** - Rejects the request, can reverse within 10 minutes

---

### Step 3A: Host APPROVES
**What happens:**
- VisitRequest status → `approved`
- **NEW Visitor record created** with status: `checked-in`
- QR code generated and sent to visitor's email
- Host gets notification confirming approval
- Visitor now appears in "Active Visitors" table

---

### Step 3B: Host DENIES
**What happens:**
- VisitRequest status → `rejected`
- Denial email sent to visitor
- Host has **10 minutes** to reverse the decision
- After 10 minutes, denial is permanent
- No Visitor record created

---

## Status Flow

```
Security Creates Request
        ↓
   STATUS: PENDING
   (waiting for host approval)
        ↓
    Host Reviews
        ↓
   ┌─────┴─────┐
   ↓           ↓
APPROVE      DENY
   ↓           ↓
STATUS:    STATUS:
CHECKED-IN  REJECTED
(Active)   (10min reversal)
```

---

## Key Features

### 1. Email Notifications
- **Request Created:** Host gets email with approve/deny options
- **Approved:** Visitor gets email with QR code
- **Denied:** Visitor gets denial email
- **Check-out:** Host gets email with visit summary

### 2. In-App Notifications
- Real-time notifications in nav bar
- Click notification to mark as read
- "Mark all as read" button
- Unread count badge

### 3. Approval Tracking
Every request tracks:
- Who created it (security guard/admin)
- When it was created
- Host employee details
- Visitor photo (stored with request)
- Email sent status
- Notification sent status

### 4. Visitor Tracking
Every visitor tracks:
- Who checked them in (name, role)
- Who checked them out (name, role)
- Check-in time
- Check-out time
- Visit duration
- Photo
- QR code

---

## Admin Capabilities

Admin can:
- ✅ Create visitor requests (same as security)
- ✅ Check out any visitor
- ✅ View complete history of all visitors
- ✅ See who checked in/out each visitor
- ✅ Export visitor records

---

## Security Guard View

Shows:
- **Pending Requests:** Awaiting host approval
- **Active Visitors:** Currently checked in
- Can check out visitors when they leave
- Can create new visitor requests

---

## Employee View

Shows:
- **My Requests:** Visitors requesting to see them
- **My Visitors:** Currently visiting them
- Can approve/deny requests
- Can create pre-approvals for expected visitors

---

## Database Models

### VisitRequest
```typescript
{
  visitorName, email, phone, company, purpose
  visitorPhotoUrl: string  // Photo stored here
  hostEmployeeId, hostEmployeeName, hostEmployeeEmail
  status: 'pending' | 'approved' | 'rejected'
  requestedBy: { userId, name, role }  // Who created request
  createdBy: 'security' | 'admin' | 'employee'
  qrCode?: string  // Generated on approval
  emailSent, notificationSent: boolean
  expiresAt: Date
}
```

### Visitor (Created AFTER Approval)
```typescript
{
  fullName, email, phoneNumber, company, purpose
  photoUrl: string
  hostEmployeeId, hostEmployeeName, hostEmployeeEmail
  checkInTime, checkOutTime, visitDuration
  status: 'checked-in' | 'checked-out'
  qrCode: string
  requestId: ObjectId  // Links to original request
  checkedInBy: { userId, name, role }
  checkedOutBy: { userId, name, role }
}
```

---

## API Endpoints

### POST /api/visitors/checkin
Creates pending visit request (NOT immediate check-in)

### PATCH /api/requests/[id]/approve
Approves request AND creates Visitor record

### PATCH /api/requests/[id]/reject
Rejects request with 10-minute reversal window

### PATCH /api/requests/[id]/reverse
Reverses denial within 10 minutes

### PATCH /api/visitors/[id]/checkout
Checks out visitor, sends summary email to host

### GET /api/notifications
Gets user's notifications

### PATCH /api/notifications/[id]/read
Marks single notification as read

### PATCH /api/notifications/mark-all-read
Marks all notifications as read

---

## Environment Variables Required

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Visitor Management System <your-email@gmail.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing the Flow

1. **As Security:** Create visitor request
2. **Check Host Email:** Should receive approval request
3. **Check Host Dashboard:** Should see pending request notification
4. **As Host:** Click approve
5. **Check Visitor List:** Visitor now appears as "Active"
6. **Check Visitor Email:** QR code sent
7. **As Security/Admin:** Check out visitor
8. **Check Host Email:** Visit summary sent

---

✅ All features working correctly with proper approval workflow!
