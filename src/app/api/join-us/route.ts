import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'role', 'message'];
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
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        message: data.message,
        status: 'PENDING',
      },
    });

    // Send notification emails
    await sendEmail({
      to: 'admin@ragijifoundation.com',
      subject: 'New Join Application Received',
      text: `
        New application received from ${data.name}
        Role: ${data.role}
        Email: ${data.email}
        Phone: ${data.phone}
        Message: ${data.message}
      `,
    });

    // Send confirmation email to applicant
    await sendEmail({
      to: data.email,
      subject: 'Application Received - Ragi Ji Foundation',
      text: `
        Dear ${data.name},

        Thank you for your interest in joining Ragi Ji Foundation. We have received your application for the ${data.role} position.

        We will review your application and get back to you soon.

        Best regards,
        Ragi Ji Foundation Team
      `,
    });

    return NextResponse.json(application, { status: 201 });

  } catch (error) {
    console.error('Error processing join application:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const applications = await prisma.joinApplication.findMany({
      orderBy: { createdAt: 'desc' },
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
