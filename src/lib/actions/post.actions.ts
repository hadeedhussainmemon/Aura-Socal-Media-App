"use server";

import { connectToDatabase } from "@/lib/mongoose";
import Post from "@/lib/models/post.model";
import User from "@/lib/models/user.model";
import Save from "@/lib/models/save.model";
import Like from "@/lib/models/like.model";

export async function getLikedPostsServer(userId: string) {
    try {
        await connectToDatabase();

        const likedPosts = await Like.find({ user: userId })
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

        // Extract posts from the mapping
        const posts = likedPosts.map(lp => lp.post).filter(post => post !== null);

        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.error('Error fetching liked posts:', error);
        return [];
    }
}

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

export async function likePostServer(postId: string, userId: string) {
    try {
        await connectToDatabase();

        const post = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );

        if (!post) throw new Error("Post not found");

        await Like.findOneAndUpdate(
            { post: postId, user: userId },
            { post: postId, user: userId },
            { upsert: true }
        );

        return JSON.parse(JSON.stringify(post));
    } catch (error) {
        console.error("Failed to like post", error);
        return null;
    }
}

export async function deleteLikeServer(postId: string, userId: string) {
    try {
        await connectToDatabase();

        const post = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: userId } },
            { new: true }
        );

        await Like.findOneAndDelete({ post: postId, user: userId });

        return JSON.parse(JSON.stringify(post));
    } catch (error) {
        console.error("Failed to delete like", error);
        return null;
    }
}

export async function savePostServer(postId: string, userId: string) {
    try {
        await connectToDatabase();

        const save = await Save.findOneAndUpdate(
            { post: postId, user: userId },
            { post: postId, user: userId },
            { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, { $addToSet: { savedPosts: postId } });

        return JSON.parse(JSON.stringify(save));
    } catch (error) {
        console.error("Failed to save post", error);
        return null;
    }
}

export async function deleteSaveServer(postId: string, userId: string) {
    try {
        await connectToDatabase();

        await Save.findOneAndDelete({ post: postId, user: userId });
        await User.findByIdAndUpdate(userId, { $pull: { savedPosts: postId } });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete save", error);
        return { success: false };
    }
}

export async function getInfinitePostsServer({ pageParam }: { pageParam?: string }) {
    try {
        await connectToDatabase();

        const query = pageParam ? { _id: { $lt: pageParam } } : {};
        const posts = await Post.find(query)
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .sort({ _id: -1 })
            .limit(10);

        return JSON.parse(JSON.stringify({
            documents: posts,
            total: posts.length
        }));
    } catch (error) {
        console.error("Failed to fetch infinite posts", error);
        return { documents: [], total: 0 };
    }
}

export async function getFollowingFeedServer(userId: string, page: number = 1, limit: number = 20) {
    try {
        await connectToDatabase();

        const user = await User.findById(userId);
        if (!user) return [];

        const posts = await Post.find({ creator: { $in: user.following } })
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.error("Failed to fetch following feed", error);
        return [];
    }
}

export async function createPostServer(postData: any) {
    try {
        await connectToDatabase();

        const newPost = await Post.create(postData);
        return JSON.parse(JSON.stringify(newPost));
    } catch (error) {
        console.error("Failed to create post", error);
        return null;
    }
}

export async function updatePostServer(postId: string, postData: any) {
    try {
        await connectToDatabase();

        const updatedPost = await Post.findByIdAndUpdate(postId, postData, { new: true });
        return JSON.parse(JSON.stringify(updatedPost));
    } catch (error) {
        console.error("Failed to update post", error);
        return null;
    }
}

export async function deletePostServer(postId: string) {
    try {
        await connectToDatabase();

        await Post.findByIdAndDelete(postId);
        await Like.deleteMany({ post: postId });
        await Save.deleteMany({ post: postId });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete post", error);
        return { success: false };
    }
}
export async function getPublicUserPosts(userId: string) {
    return getUserPostsServer(userId);
}

export async function getPublicPostById(postId: string) {
    return getPostByIdServer(postId);
}

export async function getAdminAllPosts(page = 1, limit = 10, search = '') {
    try {
        await connectToDatabase();
        const query = search ? {
            $or: [
                { caption: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ]
        } : {};

        const posts = await Post.find(query)
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments(query);

        return JSON.parse(JSON.stringify({ posts, total }));
    } catch (error) {
        return { posts: [], total: 0 };
    }
}

export async function adminDeletePost(postId: string) {
    return deletePostServer(postId);
}
