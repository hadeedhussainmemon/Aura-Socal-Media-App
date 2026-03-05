"use server";

import { connectToDatabase } from "@/lib/mongoose";
import Post from "@/lib/models/post.model";
import User from "@/lib/models/user.model";
import Save from "@/lib/models/save.model";

export async function getRecentPostsServer() {
    try {
        await connectToDatabase();

        const posts = await Post.find()
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .sort({ createdAt: -1 })
            .limit(20);

        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.error("Failed to fetch recent posts", error);
        return null;
    }
}

export async function getPostByIdServer(postId: string) {
    try {
        await connectToDatabase();

        const post = await Post.findById(postId).populate({
            path: 'creator',
            model: User,
            select: 'name username imageUrl _id'
        });

        return JSON.parse(JSON.stringify(post));
    } catch (error) {
        console.error("Failed to fetch post", error);
        return null;
    }
}

export async function getUserPostsServer(userId: string) {
    try {
        await connectToDatabase();

        const posts = await Post.find({ creator: userId })
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.error("Failed to fetch user posts", error);
        return [];
    }
}

export async function getSavedPostsServer(userId: string) {
    try {
        await connectToDatabase();

        const savedPosts = await Save.find({ user: userId })
            .populate({
                path: 'post',
                model: Post,
                populate: {
                    path: 'creator',
                    model: User,
                    select: 'name username imageUrl _id'
                }
            })
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(savedPosts));
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        return [];
    }
}

export async function searchPostsServer(query: string) {
    try {
        if (!query) return [];

        await connectToDatabase();

        const posts = await Post.find({
            $or: [
                { caption: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ]
        })
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .limit(20);

        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.error("Failed to search posts", error);
        return [];
    }
}
