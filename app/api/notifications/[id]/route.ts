import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.model";

export async function PUT(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: notificationId } = await params;
        await connectToDatabase();

        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!updatedNotification) {
            return NextResponse.json({ message: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(updatedNotification);
    } catch (error: unknown) {
        console.error("[NOTIFICATION_READ_PUT]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
