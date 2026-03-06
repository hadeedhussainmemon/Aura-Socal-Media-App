import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Save from '@/lib/models/save.model';
import Post from '@/lib/models/post.model';
import { auth } from '@/auth';

// Toggle Save Post
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: postId } = await params;
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        await connectToDatabase();

        const existingSave = await Save.findOne({ post: postId, user: userId });

        if (existingSave) {
            // Unsave
            await Save.findByIdAndDelete(existingSave._id);
            await Post.findByIdAndUpdate(postId, { $pull: { saves: userId } });
            return NextResponse.json({ message: 'Post unsaved' }, { status: 200 });
        } else {
            // Save
            await Save.create({ post: postId, user: userId });
            await Post.findByIdAndUpdate(postId, { $addToSet: { saves: userId } });
            return NextResponse.json({ message: 'Post saved' }, { status: 201 });
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        return NextResponse.json({ message: 'Error toggling save' }, { status: 500 });
    }
}
