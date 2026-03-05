import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/lib/models/user.model';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';

        await connectToDatabase();

        // Regex for case-insensitive partial match
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name username imageUrl _id')
            .limit(50);

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error fetching search results:', error);
        return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
    }
}
