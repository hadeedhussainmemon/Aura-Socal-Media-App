import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Otp from "@/lib/models/otp.model";
import User from "@/lib/models/user.model";
import { sendEmail } from "@/lib/utils/sendEmail";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before saving to DB
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save or update the OTP in the database
    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp: hashedOtp,
    });

    // Send the OTP via Email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #7928CA; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Aura</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #555; line-height: 1.6;">Thank you for signing up for Aura! Please use the following One-Time Password (OTP) to complete your registration. This code will expire in 5 minutes.</p>
          <div style="margin: 30px 0; text-align: center;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #fff; background: linear-gradient(to right, #7928CA, #FF0080); border-radius: 8px; letter-spacing: 4px;">
              ${otp}
            </span>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `;

    await sendEmail({
      email,
      subject: "Aura - Verification Code",
      message,
    });

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error sending OTP:", error);
    return NextResponse.json({ message: "Failed to send OTP", error: msg }, { status: 500 });
  }
}
