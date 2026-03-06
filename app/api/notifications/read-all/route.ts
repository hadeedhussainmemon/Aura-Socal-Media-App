import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.model";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "UserId is required" }, { status: 400 });
        }

        await connectToDatabase();

        await Notification.updateMany({ userId, read: false }, { read: true });

        return NextResponse.json({ message: "All notifications marked as read" });
    } catch (error: any) {
        console.error("[NOTIFICATIONS_READ_ALL_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
