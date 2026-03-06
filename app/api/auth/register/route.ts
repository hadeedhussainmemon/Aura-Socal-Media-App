import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
// import Otp from "@/lib/models/otp.model"; // Re-enable when OTP flow is active

export async function POST(req: Request) {
    try {
        // Temporarily disabling OTP requirement until domain is purchased
        // const { name, username, email, password, otp } = await req.json();
        const { name, username, email, password } = await req.json();

        // if (!name || !username || !email || !password || !otp) {
        if (!name || !username || !email || !password) {
            return NextResponse.json(
                // { message: "Missing required fields, including OTP" },
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // 1. Verify OTP - TEMPORARILY DISABLED
        /*
        const existingOtpRecords = await Otp.find({ email }).sort({ createdAt: -1 });
        if (existingOtpRecords.length === 0) {
            return NextResponse.json(
                { message: "OTP expired or invalid" },
                { status: 400 }
            );
        }

        const latestOtpRecord = existingOtpRecords[0];
        const isOtpValid = await bcrypt.compare(otp, latestOtpRecord.otp);

        if (!isOtpValid) {
            return NextResponse.json(
                { message: "Invalid OTP" },
                { status: 400 }
            );
        }
        */

        // 2. Check for existing users
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 400 }
            );
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                { message: "Username already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        // 4. Delete the used OTP record
        // await Otp.deleteMany({ email });

        return NextResponse.json(
            { message: "User created successfully", user: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
