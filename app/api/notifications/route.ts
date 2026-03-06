import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.model";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const limit = parseInt(searchParams.get("limit") || "20");

        if (!userId) {
            return NextResponse.json({ message: "UserId is required" }, { status: 400 });
        }

        await connectToDatabase();

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("fromUserId", "name username image_url");

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("[NOTIFICATIONS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, userId, title, message, avatar, actionUrl, fromUserId, fromUserName, fromUserAvatar } = body;

        await connectToDatabase();

        const newNotification = await Notification.create({
            userId,
            type,
            title,
            message,
            avatar,
            actionUrl,
            fromUserId,
            fromUserName,
            fromUserAvatar,
        });

        return NextResponse.json(newNotification, { status: 201 });
    } catch (error: any) {
        console.error("[NOTIFICATIONS_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
