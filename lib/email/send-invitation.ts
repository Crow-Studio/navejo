// lib/email/send-invitation.ts
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { InvitationEmail } from "./invitation-template";

interface SendInvitationEmailProps {
  to: string;
  invitedByName: string;
  invitedByEmail: string;
  organizationName: string;
  workspaceName?: string;
  inviteToken: string;
  role: string;
}

export async function sendInvitationEmail({
  to,
  invitedByName,
  invitedByEmail,
  organizationName,
  workspaceName,
  inviteToken,
  role,
}: SendInvitationEmailProps) {
  // Create the invitation URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

  // Render the email template
  const emailHtml = await render(
    InvitationEmail({
      invitedByName,
      invitedByEmail,
      organizationName,
      workspaceName,
      inviteUrl,
      role,
    })
  );

  // Create transporter with Gmail-specific settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail service
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify transporter configuration
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (error) {
    console.error("SMTP verification failed:", error);
    console.error("Make sure you're using an App Password for Gmail, not your regular password");
    throw new Error("Email configuration is invalid");
  }

  // Send email
  const info = await transporter.sendMail({
    from: `"Navejo" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `You're invited to join ${organizationName}${workspaceName ? ` - ${workspaceName}` : ''} on Navejo`,
    html: emailHtml,
  });

  console.log("Invitation email sent:", info.messageId);
  return info;
}