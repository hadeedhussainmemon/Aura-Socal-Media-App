import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/lib/models/user.model';
import { auth } from '@/auth';

// Toggle Follow/Unfollow User
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: targetUserId } = await params;
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = session.user.id;

        if (currentUserId === targetUserId) {
            return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
        }

        await connectToDatabase();

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
            return NextResponse.json({ message: 'User unfollowed successfully' }, { status: 200 });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
            return NextResponse.json({ message: 'User followed successfully' }, { status: 201 });
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        return NextResponse.json({ message: 'Error toggling follow status' }, { status: 500 });
    }
}
