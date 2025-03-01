import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Add email transport configuration
console.log('SMTP Config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? 'Set' : 'Not set',
  pass: process.env.SMTP_PASSWORD ? 'Set' : 'Not set',
  fromEmail: process.env.SMTP_FROM_EMAIL,
  adminEmail: process.env.ADMIN_EMAIL,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.ragijifoundation.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, subject, message } = body;

    // Validate the data
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Store the enquiry in the database
    const enquiry = await prisma.enquiry.create({
      data: {
        email,
        name: name || null,
        subject: subject || null,
        message,
      },
    });

    // Send confirmation email to the enquirer
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Thank you for contacting Ragi Ji Foundation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .message-box { background-color: white; padding: 15px; border-left: 4px solid #4a90e2; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Reaching Out!</h1>
            </div>
            <div class="content">
              <p>Dear ${name || 'Valued Friend'},</p>
              <p>Thank you for contacting Ragi Ji Foundation. We have received your message and appreciate you taking the time to reach out to us.</p>
              
              <div class="message-box">
                <h3>Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                <p><strong>Message:</strong> ${message}</p>
              </div>
              
              <p>Our team will review your message and get back to you as soon as possible. Usually, we respond within 24-48 business hours.</p>
              
              <p>In the meantime, you can:</p>
              <ul>
                <li>Visit our website: <a href="https://www.ragijifoundation.com">www.ragijifoundation.com</a></li>
                <li>Follow us on social media for updates</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Ragi Ji Foundation. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission - ${subject || 'No Subject'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff6b6b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .info-box { background-color: white; padding: 15px; border-left: 4px solid #ff6b6b; margin: 15px 0; }
            .timestamp { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <p class="timestamp">Received on: ${new Date().toLocaleString()}</p>
              
              <div class="info-box">
                <h3>Contact Details:</h3>
                <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                <h3>Message:</h3>
                <p>${message}</p>
              </div>
              
              <p>Please respond to this enquiry at your earliest convenience.</p>
              
              <p><a href="${process.env.ADMIN_DASHBOARD_URL || '#'}/enquiries">View in Dashboard</a></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ragi Ji Foundation - Admin Notification</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Return success response with the created enquiry
    return NextResponse.json(
      { message: 'Enquiry submitted successfully', enquiry },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.ragijifoundation.com',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );

  } catch (error) {
    console.error('Error processing enquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to retrieve enquiries (protected route)
export async function GET() {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}