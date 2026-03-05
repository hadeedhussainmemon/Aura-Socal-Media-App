import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Like from '@/lib/models/like.model';
import Post from '@/lib/models/post.model';
import { auth } from '@/auth';

// Toggle Like
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id: postId } = params;
        const userId = session.user.id;

        await connectToDatabase();

        const existingLike = await Like.findOne({ post: postId, user: userId });

        if (existingLike) {
            // Unlike
            await Like.findByIdAndDelete(existingLike._id);
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
            return NextResponse.json({ message: 'Post unliked' }, { status: 200 });
        } else {
            // Like
            await Like.create({ post: postId, user: userId });
            await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
            return NextResponse.json({ message: 'Post liked' }, { status: 201 });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ message: 'Error toggling like' }, { status: 500 });
    }
}
