import { connectToDatabase } from '@/lib/mongoose';
import User from '@/lib/models/user.model';
import Post from '@/lib/models/post.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    await connectToDatabase();

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    const user = await User.findById(userId).select('name username email imageUrl bio createdAt followers following');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const posts = await Post.find({ creator: userId })
      .populate('creator', 'name username imageUrl')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      user,
      posts: posts || [],
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
