import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/lib/models/user.model';
import { auth } from '@/auth';

// GET User by ID
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

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
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const name = formData.get('name') as string;
        const bio = formData.get('bio') as string;
        const username = formData.get('username') as string;
        const privacy_setting = formData.get('privacy_setting') as string;
        const file = formData.get('file') as File;

        await connectToDatabase();

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Ensure users can only update their own profile
        if (user._id.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
        }

        // Upload image to Cloudinary if a new file is provided
        let imageUrl = user.imageUrl;
        if (file && typeof file !== 'string') {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            imageUrl = await new Promise((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const cloudinary = require('cloudinary').v2;
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });

                cloudinary.uploader.upload_stream(
                    { folder: "socialapp_profiles" },
                    (error: Error | null, result: { secure_url: string } | undefined) => {
                        if (error) reject(error);
                        else if (result) resolve(result.secure_url);
                        else reject(new Error('Cloudinary upload failed'));
                    }
                ).end(buffer);
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, bio, imageUrl, username, privacy_setting },
            { new: true }
        ).select("-password");

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
    }
}
