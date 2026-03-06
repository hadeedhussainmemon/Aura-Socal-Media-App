import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Post from '@/lib/models/post.model';
import User from '@/lib/models/user.model';
import { auth } from '@/auth';

// GET a specific post
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const post = await Post.findById(id).populate({
            path: 'creator',
            model: User,
            select: 'name username imageUrl _id'
        });

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post, { status: 200 });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ message: 'Error fetching post' }, { status: 500 });
    }
}

// UPDATE a post
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { caption, imageUrl, location, tags } = await req.json();

        await connectToDatabase();

        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        if (post.creator.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                caption,
                imageUrl,
                location,
                tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
            },
            { new: true }
        ).populate({
            path: 'creator',
            model: User,
            select: 'name username imageUrl _id'
        });

        return NextResponse.json(updatedPost, { status: 200 });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ message: 'Error updating post' }, { status: 500 });
    }
}

// DELETE a post
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        if (post.creator.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
        }

        await Post.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ message: 'Error deleting post' }, { status: 500 });
    }
}
