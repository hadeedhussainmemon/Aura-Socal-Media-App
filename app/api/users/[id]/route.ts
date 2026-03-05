import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/lib/models/user.model';
import { auth } from '@/auth';

// GET User by ID
export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        await connectToDatabase();

        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Error fetching user' }, { status: 500 });
    }
}

// Edit User
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, bio, imageUrl, username } = await req.json();

        await connectToDatabase();

        const user = await User.findById(params.id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Ensure users can only update their own profile
        if (user._id.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { name, bio, imageUrl, username },
            { new: true }
        ).select("-password");

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
    }
}
