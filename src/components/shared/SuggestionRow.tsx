"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/lib/react-query/queriesAndMutations";
import { IUser } from "@/types";

type SuggestionRowProps = {
    user: IUser;
};

const SuggestionRow = ({ user }: SuggestionRowProps) => {
    const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(user.id || user._id || "");
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const handleFollowToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCurrentlyFollowing) {
            unfollowMutation.mutate(user.id);
        } else {
            followMutation.mutate(user.id);
        }
    };

    return (
        <div className="suggestion-row group">
            <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                <Image
                    src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt="creator"
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover border border-white/10"
                />
                <div className="flex flex-col min-w-0">
                    <p className="small-semibold text-light-1 truncate group-hover:text-primary-500 transition-colors">
                        {user.username}
                    </p>
                    <p className="tiny-medium text-light-3 truncate">
                        {user.name}
                    </p>
                </div>
            </Link>

            <Button
                type="button"
                variant="ghost"
                className={`p-0 h-auto text-xs font-bold hover:bg-transparent ${isCurrentlyFollowing ? "text-light-3 hover:text-white" : "text-primary-500 hover:text-primary-400"
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
        </div>
    );
};

export default SuggestionRow;
