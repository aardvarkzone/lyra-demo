/**
 * API route for sharing calendar events via email
 * Uses nodemailer to send ICS files as email attachments
 */

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { from, to, eventDetails, icsContent } = await request.json();

    // Create a transporter with the sender's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: from,
        // Using application password for Gmail
        pass: process.env.GMAIL_APP_PASSWORD, // Keep this in env for security
      },
    });

    const mailOptions = {
      from: from,
      to: to,
      subject: `Calendar Invite: ${eventDetails.title}`,
      text: `You've been invited to: ${eventDetails.title}\n\nDetails: ${
        eventDetails.description
      }\n\nTime: ${eventDetails.start.join("/")} - ${eventDetails.end.join(
        "/"
      )}`,
      attachments: [
        {
          filename: "event.ics",
          content: icsContent,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
