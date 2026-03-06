import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.model";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        await connectToDatabase();

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("[USER_NOTIFICATIONS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
