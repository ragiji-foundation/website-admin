import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, text, html }: EmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"Ragi Ji Foundation" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
