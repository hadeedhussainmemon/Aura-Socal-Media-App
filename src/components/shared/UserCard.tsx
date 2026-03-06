"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/lib/react-query/queriesAndMutations";
import { IUser } from "@/types";

type UserCardProps = {
  user: IUser;
};

const UserCard = ({ user }: UserCardProps) => {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const userId = user?.id || user?._id || "";
  const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(userId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  if (!user) return null;

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  return (
    <Link href={`/profile/${user.username}`} className="relative flex flex-col items-center p-6 glass-morphism rounded-[32px] border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 group overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px] group-hover:bg-primary-500/20 transition-all duration-500" />

      <div className="relative mb-4">
        <div className="relative w-24 h-24 p-1 rounded-full bg-gradient-to-tr from-[#7928CA]/20 to-[#FF0080]/20 group-hover:from-[#7928CA]/50 group-hover:to-[#FF0080]/50 transition-all duration-500">
          <Image
            src={user?.imageUrl || user?.image_url || "/assets/icons/profile-placeholder.svg"}
            alt="creator"
            fill
            className="rounded-full object-cover border-4 border-dark-1 shadow-2xl"
          />
        </div>
        {isCurrentlyFollowing && (
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary-500 rounded-full border-2 border-dark-1 flex items-center justify-center shadow-lg">
            <span className="text-[10px] text-white">✓</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-center mb-6">
        <p className="text-lg font-bold text-light-1 line-clamp-1 group-hover:aura-text-gradient transition-all duration-300">
          {user.name}
        </p>
        <p className="text-sm font-medium text-light-3">
          @{user.username}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full mt-auto">
        {!isOwnProfile ? (
          <Button
            type="button"
            className={`flex-1 h-11 rounded-2xl font-bold transition-all duration-300 ${isCurrentlyFollowing
              ? "bg-white/5 hover:bg-white/10 text-light-1 border border-white/10"
              : "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 active:scale-95"
              }`}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
          >
            {followMutation.isPending || unfollowMutation.isPending
              ? "..."
              : isCurrentlyFollowing
                ? "Following"
                : "Follow"
            }
          </Button>
        ) : (
          <Button variant="ghost" className="flex-1 h-11 rounded-2xl bg-white/5 text-light-3 font-bold border border-white/5 cursor-default hover:bg-white/5">
            Your Profile
          </Button>
        )}

        <div className="w-11 h-11 rounded-2xl flex-center bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
          <Image src="/assets/icons/share.svg" alt="share" width={18} height={18} className="opacity-60" />
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
