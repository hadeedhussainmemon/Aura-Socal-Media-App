"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import LinkifiedText from "@/components/shared/LinkifiedText";
import LikedPosts from "./LikedPosts";
import PrivacySettings from "@/components/shared/PrivacySettings";
import { useToast } from "@/components/ui/use-toast";

import {
  useGetUserById,
  useGetUserPosts,
  useFollowUser,
  useUnfollowUser,
  useIsFollowing,
  useGetFollowersCount,
  useGetFollowingCount
} from "@/lib/react-query/queriesAndMutations";



interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex items-center gap-1.5 cursor-pointer group">
    <p className="base-bold lg:body-bold text-white group-hover:text-primary-500 transition-colors">{value}</p>
    <p className="small-medium lg:base-medium text-light-3">{label}</p>
  </div>
);

type ProfileWrapperProps = {
  params: Promise<{ id: string }>;
};

const ProfileWrapper = ({ params }: ProfileWrapperProps) => {
  const { id: usernameOrId } = React.use(params);
  const { data: session, status } = useSession();
  const loggedInUser = session?.user;
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // First, get the user by ID/Username
  // Note: The param 'id' is actually the username in some routes, or ID in others.
  // Our system usually uses username for profile routes.
  const { data: profileUser, isLoading: isUserLoading, isError: userError } = useGetUserById(usernameOrId);

  const { data: followersCount = 0 } = useGetFollowersCount(profileUser?._id || profileUser?.id || "");
  const { data: followingCount = 0 } = useGetFollowingCount(profileUser?._id || profileUser?.id || "");
  const { data: isFollowingFlag } = useIsFollowing(profileUser?._id || profileUser?.id || "");

  const { data: userPosts } = useGetUserPosts(profileUser?._id || profileUser?.id || "");

  const { mutate: followUser, isPending: isFollowingLoading } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowingLoading } = useUnfollowUser();

  const isOwnProfile = loggedInUser?.id === profileUser?._id || loggedInUser?.id === profileUser?.id;
  const canSeePosts = !profileUser?.privacy_setting || profileUser.privacy_setting === 'public' || isOwnProfile || isFollowingFlag;

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      setRedirectCountdown(5);
    } else {
      setRedirectCountdown(null);
    }
  }, [status]);

  useEffect(() => {
    if (redirectCountdown === 0) {
      router.push("/sign-in");
    }
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown, router]);

  const handleFollowToggle = () => {
    if (!profileUser?._id) return;

    if (isFollowingFlag) {
      unfollowUser(profileUser._id);
    } else {
      followUser(profileUser._id);
    }
  };

  const handleShareProfile = async () => {
    if (!profileUser) return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser.name}'s Profile`,
          text: `Check out ${profileUser.name}'s profile (@${profileUser.username})!`,
          url: url,
        });
        return;
      } catch (error) {
        console.error("Web Share failed", error);
      }
    }

    await navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Profile URL copied to clipboard" });
  };

  if (isUserLoading) return <div className="flex-center w-full h-full"><Loader /></div>;
  if (userError || !profileUser) return <div className="flex-center w-full h-full"><p className="text-light-1">User not found</p></div>;

  const ActionButtons = () => (
    <div className="flex flex-wrap gap-2">
      {isOwnProfile ? (
        <>
          <Link
            href={`/update-profile/${profileUser._id}`}
            className="h-8 glass-card px-4 text-light-1 flex-center gap-2 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
          >
            <p className="flex whitespace-nowrap subtle-semibold">Edit Profile</p>
          </Link>
          <Button
            type="button"
            className="h-8 glass-card px-4 text-light-1 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
          >
            <p className="flex whitespace-nowrap subtle-semibold">Settings</p>
          </Button>
          <Button type="button" className="h-8 glass-card px-4 text-light-1 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10" onClick={handleShareProfile}>
            <p className="flex whitespace-nowrap subtle-semibold">Share</p>
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            className={`h-8 px-5 text-light-1 flex-center gap-2 rounded-lg transition-all duration-300 ${isFollowingFlag
              ? "glass-card hover:bg-white/10 border border-white/10"
              : "bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
              }`}
            onClick={handleFollowToggle}
            disabled={isFollowingLoading || isUnfollowingLoading}
          >
            <p className="flex whitespace-nowrap subtle-semibold">
              {isFollowingFlag ? "Following" : "Follow"}
            </p>
          </Button>

          <Button
            type="button"
            className="h-8 glass-card px-4 text-light-1 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
            onClick={async () => {
              if (profileUser.privacy_setting === 'private' && !isFollowingFlag) {
                toast({
                  title: "Private Account",
                  description: "You must follow this user to message them.",
                  variant: "destructive"
                });
                return;
              }

              const { getOrCreateConversation } = await import("@/lib/actions/message.actions");
              const conversation = await getOrCreateConversation(loggedInUser?.id || "", profileUser._id || "");
              if (conversation) {
                router.push(`/messages/${conversation._id}`);
              }
            }}
          >
            <p className="flex whitespace-nowrap subtle-semibold">Message</p>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="profile-container pb-20 md:pb-8 relative">
      {redirectCountdown !== null && (
        <div className="fixed top-0 left-0 w-full bg-primary-500 text-white text-center py-2 z-[100] font-medium">
          Sign in to interact. Redirecting in {redirectCountdown}s...
        </div>
      )}

      <div className="flex flex-col w-full max-w-5xl glass-morphism p-8 rounded-3xl border border-white/5">
        <div className="flex flex-row items-center gap-6 w-full">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <Image
              src={profileUser.imageUrl || profileUser.image_url || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              fill
              className="rounded-full object-cover border-2 border-primary-500/20"
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-light-1">
                @{profileUser.username || "user"}
              </h1>
              <ActionButtons />
            </div>

            <div className="flex gap-6 mt-4">
              <StatBlock value={userPosts?.length || 0} label="posts" />
              <StatBlock value={followersCount} label="followers" />
              <StatBlock value={followingCount} label="following" />
            </div>

            <div className="mt-4">
              <p className="base-semibold text-white">{profileUser.name}</p>
              <LinkifiedText
                text={profileUser.bio || ""}
                className="text-sm text-light-2 mt-1"
              />
            </div>
          </div>
        </div>

        {isOwnProfile && showPrivacySettings && (
          <div className="w-full mt-6 animate-in fade-in duration-300">
            <PrivacySettings
              currentPrivacy={profileUser.privacy_setting || "public"}
              userId={profileUser._id || profileUser.id || ""}
              onClose={() => setShowPrivacySettings(false)}
            />
          </div>
        )}
      </div>

      <div className="flex border-t border-white/5 w-full max-w-5xl mt-8">
        <div className="flex justify-center w-full">
          <button
            onClick={() => setActiveTab('posts')}
            className={`profile-tab ${activeTab === 'posts' && "profile-tab-active"}`}
          >
            <span className="uppercase tracking-widest text-[10px] font-bold">Posts</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('liked')}
              className={`profile-tab ${activeTab === 'liked' && "profile-tab-active"}`}
            >
              <span className="uppercase tracking-widest text-[10px] font-bold">Liked</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl mt-4">
        {!canSeePosts ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-morphism rounded-3xl border border-white/5 mt-4">
            <div className="w-16 h-16 rounded-full bg-dark-3 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-light-1 font-bold text-lg mb-2">This account is private</h3>
            <p className="text-light-3 text-sm max-w-xs">
              Follow @{profileUser.username} to see their posts and updates.
            </p>
          </div>
        ) : activeTab === 'posts' ? (
          <GridPostList posts={userPosts || []} showUser={false} showComments={false} />
        ) : (
          <LikedPosts />
        )}
      </div>
    </div>
  );
};

export default ProfileWrapper;