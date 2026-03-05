import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Save from '@/lib/models/save.model';
import Post from '@/lib/models/post.model';
import User from '@/lib/models/user.model';

// GET Saved Posts for a User
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();

        const savedPosts = await Save.find({ user: params.id })
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

        return NextResponse.json(savedPosts, { status: 200 });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        return NextResponse.json({ message: 'Error fetching saved posts' }, { status: 500 });
    }
}
