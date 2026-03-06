import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Post from '@/lib/models/post.model';
import User from '@/lib/models/user.model';
import { auth } from '@/auth';

// GET all posts
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        await connectToDatabase();

        const posts = await Post.find()
            .populate({ path: 'creator', model: User, select: 'name username imageUrl _id' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({ documents: posts }, { status: 200 });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
    }
}

// CREATE a new post
export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();

        const caption = formData.get('caption') as string;
        const location = formData.get('location') as string;
        const tags = formData.get('tags') as string;
        const category = formData.get('category') as string;
        const file = formData.get('file') as File;

        if (!caption || !file) {
            return NextResponse.json({ message: 'Caption and image file are required' }, { status: 400 });
        }

        // Upload image to Cloudinary
        let imageUrl = '';
        if (file) {
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
                    { folder: "socialapp_posts" },
                    (error: Error | null, result: { secure_url: string } | undefined) => {
                        if (error) reject(error);
                        else if (result) resolve(result.secure_url);
                        else reject(new Error('Cloudinary upload failed'));
                    }
                ).end(buffer);
            });
        }

        await connectToDatabase();

        const newPost = await Post.create({
            creator: session.user.id,
            caption,
            imageUrl,
            location: location || '',
            category: category || 'general',
            tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        });

        const populatedPost = await Post.findById(newPost._id).populate({
            path: 'creator',
            model: User,
            select: 'name username imageUrl _id'
        });

        return NextResponse.json(populatedPost, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ message: 'Error creating post' }, { status: 500 });
    }
}
