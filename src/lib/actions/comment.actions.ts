"use server";

import { connectToDatabase } from "@/lib/mongoose";
import Comment from "@/lib/models/comment.model";
import Post from "@/lib/models/post.model";

export async function createCommentServer(postId: string, userId: string, content: string, parentId?: string) {
    try {
        await connectToDatabase();

        const comment = await Comment.create({
            post: postId,
            user: userId,
            content,
            parentComment: parentId || null
        });

        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

        return JSON.parse(JSON.stringify(comment));
    } catch (error) {
        console.error("Failed to create comment", error);
        return null;
    }
}

export async function getPostCommentsServer(postId: string) {
    try {
        await connectToDatabase();

        const comments = await Comment.find({ post: postId, parentComment: null })
            .populate('user', 'name username imageUrl _id')
            .sort({ createdAt: -1 });

        // Fetch replies for each top-level comment
        const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
            const replies = await Comment.find({ parentComment: comment._id })
                .populate('user', 'name username imageUrl _id')
                .sort({ createdAt: 1 });

            const commentObj = comment.toObject();
            commentObj.replies = replies;
            return commentObj;
        }));

        return JSON.parse(JSON.stringify(commentsWithReplies));
    } catch (error) {
        console.error("Failed to fetch comments", error);
        return [];
    }
}

export async function deleteCommentServer(commentId: string) {
    try {
        await connectToDatabase();

        const comment = await Comment.findById(commentId);
        if (comment) {
            // Delete all replies first
            await Comment.deleteMany({ parentComment: commentId });
            await Comment.findByIdAndDelete(commentId);
            await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete comment", error);
        return { success: false };
    }
}

export async function updateCommentServer(commentId: string, content: string) {
    try {
        await connectToDatabase();

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        );

        return JSON.parse(JSON.stringify(updatedComment));
    } catch (error) {
        console.error("Failed to update comment", error);
        return null;
    }
}

export async function likeCommentServer(commentId: string, userId: string) {
    try {
        await connectToDatabase();
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $addToSet: { likes: userId } },
            { new: true }
        );
        return JSON.parse(JSON.stringify(updatedComment));
    } catch (error) {
        console.error("Failed to like comment", error);
        return null;
    }
}

export async function unlikeCommentServer(commentId: string, userId: string) {
    try {
        await connectToDatabase();
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $pull: { likes: userId } },
            { new: true }
        );
        return JSON.parse(JSON.stringify(updatedComment));
    } catch (error) {
        console.error("Failed to unlike comment", error);
        return null;
    }
}
