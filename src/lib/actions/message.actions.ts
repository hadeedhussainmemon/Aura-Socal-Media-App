"use server";

import { connectToDatabase } from "@/lib/mongoose";
import Conversation from "@/lib/models/conversation.model";
import Message from "@/lib/models/message.model";
import User from "@/lib/models/user.model";

export async function getConversations(userId: string) {
    try {
        await connectToDatabase();

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate({
                path: "participants",
                model: User,
                select: "name username imageUrl _id",
            })
            .sort({ updatedAt: -1 });

        return JSON.parse(JSON.stringify(conversations));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

export async function getMessages(conversationId: string) {
    try {
        await connectToDatabase();

        const messages = await Message.find({ conversation: conversationId })
            .populate({
                path: "sender",
                model: User,
                select: "name username imageUrl _id",
            })
            .sort({ createdAt: 1 });

        return JSON.parse(JSON.stringify(messages));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

export async function getOrCreateConversation(senderId: string, receiverId: string) {
    try {
        await connectToDatabase();

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        return JSON.parse(JSON.stringify(conversation));
    } catch (error) {
        console.error("Error get/create conversation:", error);
        return null;
    }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
    try {
        await connectToDatabase();

        // 1. Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // 2. Create message
        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            conversation: conversation._id,
            content,
        });

        // 3. Update conversation with last message
        conversation.lastMessage = newMessage._id;
        conversation.lastMessageText = content;
        await conversation.save();

        return JSON.parse(JSON.stringify(newMessage));
    } catch (error) {
        console.error("Error sending message:", error);
        return null;
    }
}

export async function markAsRead(messageId: string) {
    try {
        await connectToDatabase();
        await Message.findByIdAndUpdate(messageId, { isRead: true });
        return { success: true };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { success: false };
    }
}
