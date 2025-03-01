import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from '@/utils/email';

// Handle OPTIONS requests explicitly for CORS
export async function OPTIONS() {
  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", "https://www.ragijifoundation.com");
  headers.append("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

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
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        message: data.message,
        status: "PENDING",
      },
    });

    // Send notification email using existing email utility
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'New Join Request',
      text: `New join request from ${data.name} (${data.email})`,
      html: `
        <h2>New Join Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      `
    });

    // Add CORS headers to the response
    const headers = new Headers();
    headers.append("Access-Control-Allow-Origin", "https://www.ragijifoundation.com");
    headers.append("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new NextResponse(JSON.stringify(application), { status: 201, headers });

  } catch (error) {
    console.error("Error processing join application:", error);
    return NextResponse.json(
      { error: "Failed to process application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const applications = await prisma.joinApplication.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Add CORS headers to the response
    const headers = new Headers();
    headers.append("Access-Control-Allow-Origin", "https://www.ragijifoundation.com");
    headers.append("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new NextResponse(JSON.stringify(applications), { status: 200, headers });

  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}