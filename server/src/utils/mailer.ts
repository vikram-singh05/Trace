import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a transporter using Gmail SMTP
const transporter = env.SMTP_USER && env.SMTP_PASS ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
}) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<void> => {
  if (!transporter) {
    console.log('\n================= MOCK EMAIL SENT =================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML:    \n${html.substring(0, 200)}...`);
    console.log('===================================================\n');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Trace" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};
