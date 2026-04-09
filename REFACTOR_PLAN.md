# COMPLETE PROJECT REFACTOR PLAN

## Current Issues (From Logs & PDF Requirements)

### Critical Errors:
1. **Email Error**: SMTP credentials missing/incorrect - emails not being sent to host employees
2. **Notification Error**: 'request' type not valid in Notification model enum
3. **Old corrupted visitor records** showing "N/A" in the table
4. **Approval workflow broken** - notifications not reaching employees

### Requirements from PDF:

## I. Visitor Registration (Security Guard Creates)
When security guard checks in visitor:
1. ✅ Collect: Full Name, Contact Info, Purpose, Host Employee, Company, Photo (MANDATORY)
2. ✅ Auto-capture Check-in Time
3. ❌ **BROKEN**: Send approval request to host employee (email + in-app notification)
4. ❌ **BROKEN**: Visitor should wait for approval before entering

## II. Approval Workflow (Host Employee)
1. ❌ **BROKEN**: Host receives email notification immediately
2. ❌ **BROKEN**: Host receives in-app notification immediately  
3. ✅ Host can approve/reject via web portal
4. ✅ On approval: Generate QR code/visitor pass
5. ✅ On rejection: Notify security, visitor not allowed

## III. Pre-Approval (Employee Schedules in Advance)
1. ✅ Employee can pre-register visitors
2. ✅ Set date/time window
3. ✅ Generate QR code sent via email
4. ✅ Auto-expire after 8 hours if not used

## IV. Mandatory Photo Capture
1. ✅ Photo required for all visitors
2. ✅ Photo stored securely
3. ✅ Photo displayed on badge
4. ✅ Photo shown in all history/reports

## REFACTOR STEPS:

### Step 1: Fix Database Models (Clean Foundation)
- Fix Notification model enum to include 'request' type
- Add proper indexes for performance
- Ensure all fields are properly typed

### Step 2: Fix Email Service (Critical for Approval Flow)
- Verify SMTP configuration
- Add proper error handling
- Add email templates for all scenarios
- Test email sending thoroughly

### Step 3: Fix Check-in Flow (Security → Pending → Approval)
1. Security creates VisitRequest (status: 'pending')
2. Photo stored in request
3. Email + In-app notification sent to host
4. Host approves → Visitor created (status: 'checked-in')
5. Host rejects → Visitor denied, security notified

### Step 4: Fix Frontend Components
- Filter out invalid/old visitor records
- Show pending requests in employee dashboard
- Add clear approve/reject buttons with actions
- Show notifications properly
- Display photos everywhere

### Step 5: Add Comprehensive Error Handling
- Wrap all API calls in try-catch
- Show user-friendly error messages
- Log errors for debugging
- Handle network failures gracefully

### Step 6: Testing & Validation
- Test complete check-in → approval → check-out flow
- Test pre-approval flow
- Test rejection flow with 10-min reversal
- Test email delivery
- Test notification delivery
- Test with multiple roles (admin, employee, security)

## Implementation Order:
1. Database Models → Email Service → APIs → Frontend → Testing
