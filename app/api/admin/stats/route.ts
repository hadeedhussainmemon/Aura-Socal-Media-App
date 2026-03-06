import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/actions/user.actions';

// GET /api/admin/stats - Get basic statistics
export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
