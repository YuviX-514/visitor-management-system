# Visitor Management System - Complete Workflow

## System Overview
This VMS ensures workplace security through a structured visitor approval process with mandatory photo capture and real-time notifications.

---

## User Roles

### 1. Security Guard
- Checks in visitors at reception
- Captures mandatory visitor photo
- Creates visit requests
- Performs check-out

### 2. Employee (Host)
- Receives approval requests (email + in-app notification)
- Approves or rejects visit requests
- Can create pre-approvals for scheduled visitors
- Receives check-in/check-out notifications

### 3. Admin
- All security guard permissions
- All employee permissions
- View complete system history
- Access to all visitor records
- System oversight

---

## Complete Workflows

### A. Walk-in Visitor Flow (Security Desk Check-in)

**Step 1: Security Guard Creates Request**
1. Visitor arrives at reception
2. Security opens "Check In Visitor" dialog
3. Collects information:
   - Full Name (required)
   - Email (required, validated as real email)
   - Phone Number (required)
   - Company/Organization (optional)
   - Purpose of Visit (required)
   - Host Employee (search by name, shows: Name, ID, Department, Email)
   - **Photo (MANDATORY)** - Upload or capture
4. Security submits → Creates **VisitRequest (status: 'pending')**

**Step 2: Automated Notifications Sent**
- **Email** sent to host employee with:
  - Visitor details
  - Photo
  - Approve/Deny buttons (direct links)
- **In-app notification** appears in host's dashboard
- Visitor **WAITS** at reception (not yet checked-in)

**Step 3: Host Employee Approves/Rejects**

**Option A: APPROVED**
- Host clicks "Approve" (email or dashboard)
- System generates:
  - Visitor record (status: 'checked-in')
  - QR code for visitor
  - Visitor badge
- Host receives confirmation
- Security is notified to allow visitor in
- Visitor enters premises

**Option B: REJECTED**
- Host clicks "Reject" with reason
- 10-minute reversal window starts
- Security notified: Visitor not allowed
- Visitor turned away
- Within 10 minutes: Host can reverse decision

**Step 4: Check-out**
- When visitor leaves, security/admin performs check-out
- System records:
  - Check-out time
  - Visit duration
  - Who checked them out
- Email sent to host: "Visitor has left"

---

### B. Pre-Approval Flow (Scheduled Visitors)

**Step 1: Employee Pre-Registers Visitor**
1. Employee logs into dashboard
2. Clicks "Pre-Approve Visitor"
3. Enters:
   - Visitor details (name, email, phone, company, purpose)
   - Scheduled date and time
   - Expected arrival time
4. System generates:
   - **VisitRequest (status: 'approved', isPreApproval: true)**
   - QR code
5. Email sent to visitor with:
   - QR code attachment
   - Visit details
   - "Scan this at reception"
   - Valid for: Scheduled time + 8 hours

**Step 2: Visitor Arrives**
1. Visitor shows QR code at reception
2. Security scans QR code
3. System:
   - Validates QR (not expired, matches visitor)
   - Creates Visitor record (check-in)
   - Captures photo for records
4. Visitor enters immediately (already approved)

**Step 3: Auto-Expiration**
- If visitor doesn't arrive within 8 hours of scheduled time
- Request status → 'expired'
- QR code becomes invalid

---

### C. Denial Reversal (10-Minute Window)

**Scenario: Host rejects by mistake**
1. Host clicks "Reject" → Visitor denied
2. System starts 10-minute countdown
3. Host sees "Reverse Decision" button (dashboard)
4. Within 10 minutes:
   - Host clicks "Reverse"
   - Request status → 'approved'
   - Visitor record created
   - QR code generated
   - Security notified to allow in
5. After 10 minutes:
   - Reversal option disabled
   - Rejection is permanent

---

## Data Tracking (Audit Trail)

Every visitor record contains:
```
{
  fullName, email, phoneNumber, company, purpose,
  hostEmployeeName, hostEmployeeEmail,
  photoUrl (mandatory),
  checkInTime (timestamp),
  checkOutTime (timestamp),
  visitDuration (calculated),
  status ('checked-in' | 'checked-out'),
  qrCode,
  checkedInBy: {
    userId, name, role (security | admin)
  },
  checkedOutBy: {
    userId, name, role (security | admin)  
  }
}
```

**Admin can see:**
- Who let the visitor in (security guard name)
- Who checked them out (security guard/admin name)
- Complete timeline: Request → Approval → Check-in → Check-out
- Photo at all stages
- Email delivery status
- Notification delivery status

---

## Security Features

1. **Real Email Validation**
   - Blocks disposable/fake emails
   - Ensures contact is legitimate

2. **Mandatory Photo Capture**
   - Cannot check-in without photo
   - Photo required for security compliance
   - Stored securely (base64 in database)
   - Displayed on all records

3. **Approval Required**
   - Walk-in visitors MUST be approved
   - No unauthorized entry
   - Host confirms they expect the visitor

4. **Complete Audit Trail**
   - Every action logged
   - Who performed each action
   - Timestamps for all events
   - Cannot be deleted (only archived)

5. **Time-based Access Control**
   - Pre-approvals expire after 8 hours
   - Denied requests have 10-min reversal window
   - All requests expire after 24 hours

---

## Notification System

### Email Notifications:
1. **Visit Request** → Host (when security checks in visitor)
2. **Approval Confirmation** → Visitor (with QR code)
3. **Pre-Approval** → Visitor (with QR code for scheduled visit)
4. **Denial Notice** → Visitor (request rejected)
5. **Check-out Notification** → Host (visitor has left)

### In-App Notifications:
1. **New Visit Request** → Host (approval needed)
2. **Visitor Checked In** → Host (approved visitor arrived)
3. **Visitor Checked Out** → Host (visitor left)
4. **Request Approved** → Host (confirmation)
5. **Request Rejected** → Host (with reversal timer)

All notifications:
- Real-time updates
- Mark as read functionality
- Clickable (navigate to relevant page)
- Badge count on navbar

---

## Dashboard Views

### Security Guard Dashboard:
- Active Visitors count
- Total visitors today
- Check In Visitor button
- Active Visitors table (can check-out)
- All Visitors table (history)

### Employee Dashboard:
- Pending Requests tab (requires approval)
- My Visitors tab (approved visitors)
- Pre-Approve button
- Notifications dropdown

### Admin Dashboard:
- Check In Visitor (like security)
- System Overview
- All Visitors (complete history)
- All Requests (pending, approved, rejected)
- Statistics and analytics
- History page (filters by date, status, name)

---

## Environment Variables Required

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vms

# JWT
JWT_SECRET=your-secret-key-min-32-characters

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Gmail App Password
SMTP_FROM="VMS <noreply@vms.com>"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Installation & Setup

```bash
# 1. Clone and install
git clone <repo>
cd visitor-management-system
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your MongoDB and SMTP credentials

# 3. Clean database (remove old records)
node scripts/cleanup-database.js

# 4. Run development server
pnpm dev

# 5. Create test users
# Visit http://localhost:3000/signup
# Create: 1 Admin, 1 Employee, 1 Security Guard
```

---

## Testing Checklist

- [ ] Security can check-in visitor → Creates pending request
- [ ] Host receives email notification immediately
- [ ] Host receives in-app notification immediately  
- [ ] Host can approve → Visitor checked-in
- [ ] Host can reject → Visitor denied, 10-min reversal works
- [ ] Security can check-out visitor → Host receives notification
- [ ] Employee can pre-approve → Visitor receives QR via email
- [ ] Pre-approval expires after 8 hours if unused
- [ ] Photos are mandatory and displayed everywhere
- [ ] Admin can see who checked in/out each visitor
- [ ] History page shows complete audit trail
- [ ] Real email validation blocks fake emails
- [ ] Notifications mark as read correctly
- [ ] All timestamps are accurate

---

## Troubleshooting

**Emails not sending?**
- Verify SMTP credentials in .env.local
- For Gmail: Enable 2FA, generate App Password
- Check spam folder

**Notifications not appearing?**
- Check browser console for errors
- Verify user is logged in
- Refresh the page

**Old corrupted records showing?**
- Run: `node scripts/cleanup-database.js`
- This removes invalid visitor records

**API errors?**
- Check MongoDB connection
- Verify all environment variables set
- Check server logs for detailed errors
