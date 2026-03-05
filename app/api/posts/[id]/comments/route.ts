import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Comment from '@/lib/models/comment.model';
import User from '@/lib/models/user.model';
import { auth } from '@/auth';

// GET Comments for a Post
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();

        const comments = await Comment.find({ post: params.id })
            .populate({
                path: 'user',
                model: User,
                select: 'name username imageUrl _id'
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ message: 'Error fetching comments' }, { status: 500 });
    }
}

// CREATE a Comment
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ message: 'Content is required' }, { status: 400 });
        }

        await connectToDatabase();

        const newComment = await Comment.create({
            post: params.id,
            user: session.user.id,
            content,
        });

        const populatedComment = await Comment.findById(newComment._id).populate({
            path: 'user',
            model: User,
            select: 'name username imageUrl _id'
        });

        return NextResponse.json(populatedComment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ message: 'Error creating comment' }, { status: 500 });
    }
}
