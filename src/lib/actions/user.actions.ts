"use server";

import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import Post from "@/lib/models/post.model";

export async function getUserByIdServer(userId: string) {
    try {
        await connectToDatabase();

        const user = await User.findById(userId).select('-password');

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Failed to fetch user", error);
        return null;
    }
}

export async function getUserByUsernameServer(username: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ username }).select('-password');

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Failed to fetch user by username", error);
        return null;
    }
}

export async function getAllUsersServer(limit = 20) {
    try {
        await connectToDatabase();

        const users = await User.find({})
            .select('name username imageUrl _id')
            .limit(limit);

        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Failed to fetch all users", error);
        return [];
    }
}

export async function searchUsersServer(query: string, limit = 50) {
    try {
        if (!query) return [];

        await connectToDatabase();

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name username imageUrl _id')
            .limit(limit);

        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Failed to search users", error);
        return [];
    }
}


export async function followUserServer(followerId: string, followingId: string) {
    try {
        await connectToDatabase();

        await User.findByIdAndUpdate(followerId, { $addToSet: { following: followingId } });
        await User.findByIdAndUpdate(followingId, { $addToSet: { followers: followerId } });

        return { success: true };
    } catch (error) {
        console.error("Failed to follow user", error);
        return { success: false };
    }
}

export async function unfollowUserServer(followerId: string, followingId: string) {
    try {
        await connectToDatabase();

        await User.findByIdAndUpdate(followerId, { $pull: { following: followingId } });
        await User.findByIdAndUpdate(followingId, { $pull: { followers: followerId } });

        return { success: true };
    } catch (error) {
        console.error("Failed to unfollow user", error);
        return { success: false };
    }
}

export async function isFollowingServer(followerId: string, followingId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(followerId);
        return user?.following.includes(followingId);
    } catch (error) {
        console.error("Failed to check follow status", error);
        return false;
    }
}

export async function getFollowersCountServer(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(userId);
        return user?.followers.length || 0;
    } catch (error) {
        console.error("Failed to get followers count", error);
        return 0;
    }
}

export async function getFollowingCountServer(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(userId);
        return user?.following.length || 0;
    } catch (error) {
        console.error("Failed to get following count", error);
        return 0;
    }
}

export async function updateUserServer(userId: string, userData: Record<string, unknown>) {
    try {
        await connectToDatabase();

        const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true }).select('-password');
        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        console.error("Failed to update user", error);
        return null;
    }
}

export async function getCurrentUserServer(userId: string) {
    try {
        await connectToDatabase();
        if (!userId) return null;
        const user = await User.findById(userId).select('-password');
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Failed to fetch current user", error);
        return null;
    }
}
export async function getAdminStats() {
    try {
        await connectToDatabase();
        const [userCount, postCount, adminCount] = await Promise.all([
            User.countDocuments({}),
            Post.countDocuments({}),
            User.countDocuments({ role: 'admin' })
        ]);
        return { userCount, postCount, adminCount };
    } catch (error) {
        console.error("Failed to get admin stats", error);
        return { userCount: 0, postCount: 0, adminCount: 0 };
    }
}

export async function checkAdminAccess(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(userId);
        return user?.role === 'admin';
    } catch {
        return false;
    }
}

export async function getAdminUsers() {
    try {
        await connectToDatabase();
        const admins = await User.find({ role: 'admin' }).select('name username imageUrl _id');
        return JSON.parse(JSON.stringify(admins));
    } catch {
        return [];
    }
}

export async function addAdminUser(email: string) {
    try {
        await connectToDatabase();
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
        return !!user;
    } catch {
        return false;
    }
}

export async function removeAdminUser(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findByIdAndUpdate(userId, { role: 'user' }, { new: true });
        return !!user;
    } catch {
        return false;
    }
}

export async function getAdminAllUsers(page = 1, limit = 10, search = '') {
    try {
        await connectToDatabase();
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        return JSON.parse(JSON.stringify({ users, total }));
    } catch (error) {
        console.error("Failed to get all admin users", error);
        return { users: [], total: 0 };
    }
}

export async function getAdminUserDetails(userId: string) {
    return getUserByIdServer(userId);
}

export async function toggleUserActivation(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(userId);
        if (!user) return null;

        user.isDeactivated = !user.isDeactivated;
        await user.save();
        return JSON.parse(JSON.stringify(user));
    } catch {
        return null;
    }
}

export async function deactivateUser(userId: string) {
    try {
        await connectToDatabase();
        await User.findByIdAndUpdate(userId, { isDeactivated: true });
        return true;
    } catch {
        return false;
    }
}

export async function getPublicUserById(userId: string) {
    return getUserByIdServer(userId);
}

export async function getPublicFollowersCount(userId: string) {
    return getFollowersCountServer(userId);
}

export async function getPublicFollowingCount(userId: string) {
    return getFollowingCountServer(userId);
}

export async function sendPasswordResetEmail(email: string) {
    try {
        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("No account found with this email address. Please check and try again.");
        }

        // Placeholder for real email service
        console.log(`🚀 Password reset logic: A reset link would be generated for ${user.email} (${user.name})`);

        // In a real app, you'd generate a JWT token and send the email here
        // For now, we return true to indicate the "process" succeeded for valid accounts
        return true;
    } catch (error: any) {
        console.error("❌ Error in sendPasswordResetEmail:", error);
        throw new Error(error.message || "Something went wrong. Please try again later.");
    }
}

export async function updateUserPassword(newPassword: string) {
    // This would normally be done via a secure token route, placeholder for now
    console.log("Updating password placeholder for:", newPassword.substring(0, 3) + "...");
    return true;
}

export async function getFollowers(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(userId).populate({
            path: 'followers',
            model: User,
            select: 'name username imageUrl _id'
        });
        return JSON.parse(JSON.stringify(user?.followers || []));
    } catch {
        return [];
    }
}

export async function getFollowing(userId: string) {
    try {
        await connectToDatabase();
        const user = await User.findById(userId).populate({
            path: 'following',
            model: User,
            select: 'name username imageUrl _id'
        });
        return JSON.parse(JSON.stringify(user?.following || []));
    } catch {
        return [];
    }
}
