"use server";

import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import Post from "@/lib/models/post.model";

export async function getUserByIdServer(userId: string) {
    try {
        await connectToDatabase();

        const user = await User.findById(userId).select('-password');

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Failed to fetch user", error);
        return null;
    }
}

export async function getAllUsersServer(limit = 20) {
    try {
        await connectToDatabase();

        const users = await User.find({})
            .select('name username imageUrl _id')
            .limit(limit);

        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Failed to fetch all users", error);
        return [];
    }
}

export async function searchUsersServer(query: string, limit = 50) {
    try {
        if (!query) return [];

        await connectToDatabase();

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name username imageUrl _id')
            .limit(limit);

        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Failed to search users", error);
        return [];
    }
}

