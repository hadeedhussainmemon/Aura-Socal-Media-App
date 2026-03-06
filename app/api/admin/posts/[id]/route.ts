import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { adminDeletePost } from '@/lib/actions/post.actions';
import { checkAdminAccess } from '@/lib/actions/user.actions';

// DELETE /api/admin/posts/[id] - Delete any post
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

    const { success } = await adminDeletePost(resolvedParams.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Post deleted successfully',
      postId: resolvedParams.id
    });

  } catch (error) {
    console.error('Admin post deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
