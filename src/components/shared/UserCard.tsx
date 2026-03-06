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
  const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(user.id || user._id || "");
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation();

    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(user.id);
    } else {
      followMutation.mutate(user.id);
    }
  };

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <Link href={`/profile/${user.id || user._id}`} className="user-card glass-card hover:bg-white/5 transition-all duration-300 border border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-glass group">
      <div className="relative">
        <Image
          src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          width={64}
          height={64}
          className="rounded-full w-16 h-16 object-cover border-2 border-white/10 group-hover:border-primary-500/50 transition-all duration-300 shadow-lg"
        />
        <div className="absolute inset-0 rounded-full aura-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      <div className="flex-center flex-col gap-1">
        <p className="base-bold text-light-1 text-center line-clamp-1 group-hover:aura-text-gradient transition-all duration-300">
          {user.name}
        </p>
        <p className="small-medium text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      {!isOwnProfile && (
        <Button
          type="button"
          size="sm"
          className={`px-5 h-9 rounded-xl transition-all duration-300 ${isCurrentlyFollowing
            ? "glass-card hover:bg-white/10 text-light-1"
            : "bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/20"
            }`}
          onClick={handleFollowToggle}
          disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
        >
          {followMutation.isPending || unfollowMutation.isPending
            ? "Loading..."
            : isCurrentlyFollowing
              ? "Following"
              : "Follow"
          }
        </Button>
      )}
    </Link>
  );
};

export default UserCard;
