import { prisma } from "@/lib/server/db";
import { generateSessionToken } from "@/lib/server/session";
import { createTransport } from "nodemailer";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { MagicLinkEmail } from "@/lib/email/magic-link-email";

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Create or update user first
    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // Don't update existing users
      create: {
        id: crypto.randomUUID(), // Generate a new UUID for new users
        email,
        emailVerified: false,
        profile: {
          create: {
            name: email.split('@')[0], // Default name from email
            imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${email}` // Default avatar
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Generate token
    const token = generateSessionToken();
    const expires = new Date(Date.now() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    // Create verification token
    await prisma.verificationToken.create({
      data: {
        token,
        expires,
        identifier: email,
        userId: user.id
      }
    });

    // Generate magic link
    const magicLink = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;

    // Create email transport
    const transport = createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Render email template
    const emailHtml = await render(MagicLinkEmail({ magicLink }));

    // Send email
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your login link for Bookmark SaaS",
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}