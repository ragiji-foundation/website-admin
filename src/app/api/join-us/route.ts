import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from 'nodemailer';
import { joinApplicationTemplates } from '@/utils/emailTemplates';

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

// Handle OPTIONS requests explicitly for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, role, message } = data;

    // Validate required fields
    const requiredFields = ["name", "email", "phone", "role", "message"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create application in database
    const application = await prisma.joinApplication.create({
      data: {
        name,
        email,
        phone,
        role,
        message,
        status: "PENDING",
      },
    });

    // Send confirmation email to applicant with enhanced template
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Application Received - Ragi Ji Foundation',
      html: joinApplicationTemplates.applicant(data)
    });

    // Send notification email to admin with enhanced template
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Join Application',
      html: joinApplicationTemplates.admin(data)
    });

    return NextResponse.json(
      { message: 'Application submitted successfully', application },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );

  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const applications = await prisma.joinApplication.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
