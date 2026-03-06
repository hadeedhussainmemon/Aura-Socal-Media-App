import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.model";

export async function POST(
    req: Request
) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ message: "Ids array is required" }, { status: 400 });
        }

        await connectToDatabase();

        await Notification.updateMany(
            { _id: { $in: ids } },
            { read: true }
        );

        return NextResponse.json({ message: "Notifications marked as read" });
    } catch (error: unknown) {
        console.error("[USER_NOTIFICATIONS_READ_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
