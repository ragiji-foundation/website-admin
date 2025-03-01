const emailStyles = `
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    line-height: 1.6;
  }
  .email-header {
    background: #FF6B00;
    padding: 20px;
    text-align: center;
  }
  .email-header img {
    max-width: 200px;
    height: auto;
  }
  .email-body {
    padding: 30px 20px;
    background: #ffffff;
  }
  .email-footer {
    background: #f7f7f7;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #666;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background: #FF6B00;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin: 20px 0;
  }
  .detail-box {
    background: #f9f9f9;
    padding: 15px;
    border-left: 4px solid #FF6B00;
    margin: 10px 0;
  }
  h1 { color: #333; margin-bottom: 20px; }
  h2 { color: #666; font-size: 18px; }
`;

export const createEmailTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo-white.png" alt="Ragi Ji Foundation" />
        </div>
        <div class="email-body">
          ${content}
        </div>
        <div class="email-footer">
          <p>© ${new Date().getFullYear()} Ragi Ji Foundation. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}">Visit our website</a> |
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact-us">Contact us</a>
          </p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
  </html>
`;

export const joinApplicationTemplates = {
  applicant: (data: any) => createEmailTemplate(`
    <h1>Thank you for your interest in joining us!</h1>
    <p>Dear ${data.name},</p>
    <p>We have received your application and will review it shortly. Here are your application details:</p>
    
    <div class="detail-box">
      <h2>Application Details</h2>
      <p><strong>Role:</strong> ${data.role}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    </div>

    <p>What's next?</p>
    <ul>
      <li>Our team will review your application</li>
      <li>If your profile matches our requirements, we'll contact you for next steps</li>
      <li>The process usually takes 3-5 business days</li>
    </ul>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/careers" class="button">View More Opportunities</a>
  `),

  admin: (data: any) => createEmailTemplate(`
    <h1>New Join Application Received</h1>
    <div class="detail-box">
      <h2>Applicant Details</h2>
      <p><strong>Role:</strong> ${data.role}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/applications" class="button">View Application</a>
  `)
};
