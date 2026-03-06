import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminUserDetails, toggleUserActivation, checkAdminAccess, getFollowersCountServer, getFollowingCountServer } from '@/lib/actions/user.actions';
import { getUserPostsServer } from '@/lib/actions/post.actions';

// GET /api/admin/users/[id] - Get user details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const hasAdminAccess = await checkAdminAccess(session.user.id);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const user = await getAdminUserDetails(resolvedParams.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user statistics
    const [posts, followersCount, followingCount] = await Promise.all([
      getUserPostsServer(resolvedParams.id),
      getFollowersCountServer(resolvedParams.id),
      getFollowingCountServer(resolvedParams.id)
    ]);

    const stats = {
      postsCount: posts.length,
      followersCount: followersCount,
      followingCount: followingCount
    };

    return NextResponse.json({
      user,
      stats
    });

  } catch (error) {
    console.error('Admin user details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Deactivate user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const hasAdminAccess = await checkAdminAccess(session.user.id);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Prevent self-deactivation
    if (session.user.id === resolvedParams.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const success = await toggleUserActivation(resolvedParams.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to deactivate user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User status updated successfully',
      userId: resolvedParams.id
    });

  } catch (error) {
    console.error('Admin user deactivation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
