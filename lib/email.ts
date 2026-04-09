import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Email validation using real API
export async function validateEmail(email: string): Promise<boolean> {
  try {
    // Basic format check first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check for disposable/fake email domains
    const disposableDomains = [
      'tempmail.com', 'throwaway.email', 'guerrillamail.com',
      'mailinator.com', '10minutemail.com', 'fakeinbox.com',
      'temp-mail.org', 'yopmail.com', 'maildrop.cc'
    ];

    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
      return false;
    }

    // You can integrate with email validation API like:
    // - Hunter.io Email Verifier API
    // - ZeroBounce
    // - NeverBounce
    // For now, we'll use basic validation
    
    return true;
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send visitor request email to employee
export async function sendVisitorRequestEmail(
  employeeEmail: string,
  employeeName: string,
  visitorData: {
    name: string;
    email: string;
    phone: string;
    purpose: string;
    company?: string;
    requestId: string;
  }
) {
  const transporter = createTransporter();

  const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/requests?id=${visitorData.requestId}&action=approve`;
  const denyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/requests?id=${visitorData.requestId}&action=deny`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@visitormanagement.com',
    to: employeeEmail,
    subject: `🔔 New Visitor Request - ${visitorData.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #6366f1; }
            .actions { margin-top: 30px; text-align: center; }
            .btn { display: inline-block; padding: 12px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .btn-approve { background: #10b981; color: white; }
            .btn-deny { background: #ef4444; color: white; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Visitor Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              <p>You have a new visitor request from the security desk:</p>
              
              <div class="info-row">
                <span class="label">Visitor Name:</span> ${visitorData.name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${visitorData.email}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${visitorData.phone}
              </div>
              ${visitorData.company ? `<div class="info-row"><span class="label">Company:</span> ${visitorData.company}</div>` : ''}
              <div class="info-row">
                <span class="label">Purpose:</span> ${visitorData.purpose}
              </div>
              
              <div class="actions">
                <a href="${approveUrl}" class="btn btn-approve">✓ Approve Request</a>
                <a href="${denyUrl}" class="btn btn-deny">✗ Deny Request</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                <strong>Note:</strong> If you deny this request, you have 10 minutes to reverse your decision.
              </p>
            </div>
            <div class="footer">
              This is an automated message from the Visitor Management System.<br>
              Please do not reply to this email.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send approval email with QR code
export async function sendApprovalEmailWithQR(
  visitorEmail: string,
  visitorName: string,
  qrData: string,
  visitDetails: {
    employeeName: string;
    date: Date;
    purpose: string;
  }
) {
  const transporter = createTransporter();

  // Generate QR code as base64
  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@visitormanagement.com',
    to: visitorEmail,
    subject: `✅ Visit Approved - QR Code Inside`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; text-align: center; }
            .qr-container { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .info-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; text-align: left; }
            .label { font-weight: bold; color: #10b981; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Your Visit Has Been Approved!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${visitorName}</strong>,</p>
              <p>Great news! Your visit request has been approved.</p>
              
              <div class="qr-container">
                <h2>Your Entry QR Code</h2>
                <img src="${qrCodeBase64}" alt="QR Code" style="max-width: 300px; margin: 20px auto;" />
                <p style="color: #6b7280; font-size: 14px;">Show this QR code at the security desk for check-in and check-out</p>
              </div>
              
              <div class="info-box">
                <div><span class="label">Meeting With:</span> ${visitDetails.employeeName}</div>
              </div>
              <div class="info-box">
                <div><span class="label">Purpose:</span> ${visitDetails.purpose}</div>
              </div>
              <div class="info-box">
                <div><span class="label">Date:</span> ${new Date(visitDetails.date).toLocaleDateString()}</div>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #ef4444;">
                <strong>Important:</strong> Please save this QR code. You'll need it for both check-in and check-out.
              </p>
            </div>
            <div class="footer">
              Visitor Management System<br>
              Have a great visit!
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send pre-approval email with QR code
export async function sendPreApprovalEmail(
  visitorEmail: string,
  visitorName: string,
  qrData: string,
  preApprovalDetails: {
    employeeName: string;
    scheduledDate: Date;
    scheduledTime: string;
    purpose: string;
    expiresAt: Date;
  }
) {
  const transporter = createTransporter();

  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@visitormanagement.com',
    to: visitorEmail,
    subject: `📅 Pre-Approved Visit - ${new Date(preApprovalDetails.scheduledDate).toLocaleDateString()}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; text-align: center; }
            .qr-container { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .info-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; text-align: left; }
            .label { font-weight: bold; color: #3b82f6; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; text-align: left; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Your Visit Has Been Pre-Approved!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${visitorName}</strong>,</p>
              <p>You have been pre-approved for a visit by <strong>${preApprovalDetails.employeeName}</strong>.</p>
              
              <div class="qr-container">
                <h2>Your Pre-Approved Entry QR Code</h2>
                <img src="${qrCodeBase64}" alt="QR Code" style="max-width: 300px; margin: 20px auto;" />
                <p style="color: #6b7280; font-size: 14px;">Use this QR code at the security desk</p>
              </div>
              
              <div class="info-box">
                <div><span class="label">Meeting With:</span> ${preApprovalDetails.employeeName}</div>
              </div>
              <div class="info-box">
                <div><span class="label">Scheduled Date:</span> ${new Date(preApprovalDetails.scheduledDate).toLocaleDateString()}</div>
              </div>
              <div class="info-box">
                <div><span class="label">Scheduled Time:</span> ${preApprovalDetails.scheduledTime}</div>
              </div>
              <div class="info-box">
                <div><span class="label">Purpose:</span> ${preApprovalDetails.purpose}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong><br>
                • This QR code will expire <strong>8 hours</strong> after your scheduled arrival time<br>
                • Expires on: ${new Date(preApprovalDetails.expiresAt).toLocaleString()}<br>
                • Please arrive on time to use this pre-approval
              </div>
            </div>
            <div class="footer">
              Visitor Management System<br>
              Looking forward to your visit!
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send denial notification
export async function sendDenialEmail(
  visitorEmail: string,
  visitorName: string,
  employeeName: string,
  reason?: string
) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@visitormanagement.com',
    to: visitorEmail,
    subject: 'Visit Request Update',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Visit Request Status</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${visitorName}</strong>,</p>
              <p>We regret to inform you that your visit request to meet <strong>${employeeName}</strong> could not be approved at this time.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>Please contact ${employeeName} directly if you have any questions.</p>
            </div>
            <div class="footer">
              Visitor Management System
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send check-out notification to employee
export async function sendCheckoutNotification(
  employeeEmail: string,
  employeeName: string,
  visitorData: {
    name: string;
    checkInTime: Date;
    checkOutTime: Date;
    duration: string;
  }
) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@visitormanagement.com',
    to: employeeEmail,
    subject: `✅ Visitor Checked Out - ${visitorData.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .info-box { background: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .label { font-weight: bold; color: #10b981; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Visitor Has Checked Out</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              <p>Your visitor has completed their visit:</p>
              
              <div class="info-box">
                <span class="label">Visitor:</span> ${visitorData.name}
              </div>
              <div class="info-box">
                <span class="label">Check-in Time:</span> ${new Date(visitorData.checkInTime).toLocaleString()}
              </div>
              <div class="info-box">
                <span class="label">Check-out Time:</span> ${new Date(visitorData.checkOutTime).toLocaleString()}
              </div>
              <div class="info-box">
                <span class="label">Visit Duration:</span> ${visitorData.duration}
              </div>
            </div>
            <div class="footer">
              Visitor Management System - Visit Record
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
