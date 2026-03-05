import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";

export async function POST(req: Request) {
    try {
        const { name, username, email, password } = await req.json();

        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDatabase();

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
