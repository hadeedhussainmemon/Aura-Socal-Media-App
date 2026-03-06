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
import { PRIVACY_SETTINGS } from "@/constants";

import { getUserByUsernameServer } from "@/lib/actions/user.actions";
import { getUserPostsServer } from "@/lib/actions/post.actions";

import { IPost, IUser } from "@/types";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5 shadow-sm">
    <p className="small-semibold lg:body-bold aura-text-gradient">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

type ProfileWrapperProps = {
  params: Promise<{ id: string }>;
};

const ProfileWrapper = ({ params }: ProfileWrapperProps) => {
  const { id: username } = React.use(params);
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isCurrentlyFollowing, setIsCurrentlyFollowing] = useState(false);

  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      try {
        setIsUserLoading(true);
        // FETCH BY USERNAME instead of ID
        const data = await getUserByUsernameServer(username);
        setCurrentUser(data);

        if (data) {
          setFollowersCount(data.followers?.length || 0);
          setFollowingCount(data.following?.length || 0);

          if (user?.id) {
            setIsCurrentlyFollowing(data.followers?.includes(user.id) || false);
          }

          // Fetch posts using internal ID from the fetched user
          const posts = await getUserPostsServer(data._id || data.id);
          setUserPosts(posts || []);
        }
      } catch (error) {
        console.error(error);
        setUserError(true);
      } finally {
        setIsUserLoading(false);
      }
    }
    fetchUserData();
  }, [username, user?.id]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      setRedirectCountdown(5);
    } else {
      setRedirectCountdown(null);
    }
  }, [status]);

  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown === 0) {
      router.push("/sign-in");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);


  const handleFollowToggle = async () => {
    if (!currentUser?._id || !user?.id) return;

    try {
      setIsFollowingLoading(true);
      const res = await fetch(`/api/users/${currentUser._id}/follow`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow/unfollow");

      // Optimistic UI update
      if (isCurrentlyFollowing) {
        setFollowersCount(prev => Math.max(0, prev - 1));
        setIsCurrentlyFollowing(false);
      } else {
        setFollowersCount(prev => prev + 1);
        setIsCurrentlyFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow status", error);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  // ==================================================================
  // NEW ROBUST SHARE/COPY FUNCTION
  // ==================================================================
  const handleShareProfile = async () => {
    if (!currentUser) return;
    const url = window.location.href;

    // --- 1. Try Web Share API (Mobile, HTTPS only) ---
    if (navigator.share && window.location.protocol === 'https:') {
      try {
        await navigator.share({
          title: `${currentUser.name}'s Profile`,
          text: `Check out ${currentUser.name}'s profile (@${currentUser.username})!`,
          url: url,
        });
        return; // Success!
      } catch (error) {
        console.error("Web Share API failed:", error);
      }
    }

    // --- 2. Fallback to Modern Clipboard API (If available) ---
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        alert("Profile URL copied to clipboard!");
        return; // Success!
      } catch (error) {
        console.error("Clipboard API failed:", error);
      }
    }

    // --- 3. Ultimate Fallback: Legacy execCommand (for HTTP/older browsers) ---
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Profile URL copied to clipboard!");
    } catch (error) {
      console.error("Legacy copy command failed:", error);
      alert("Could not copy URL. Please copy it manually.");
    }
  };
  // ==================================================================

  const isOwnProfile = user?.id === currentUser?._id;

  if (isUserLoading) {
    return <div className="flex-center w-full h-full"><Loader /></div>;
  }
  if (userError) {
    return <div className="flex-center w-full h-full"><p className="text-light-1">Error loading user profile</p></div>;
  }
  if (!currentUser) {
    return <div className="flex-center w-full h-full"><p className="text-light-1">User not found</p></div>;
  }

  const ActionButtons = () => (
    <div className="flex gap-2 w-full mt-3">
      {isOwnProfile ? (
        <>
          <Link
            href={`/update-profile/${currentUser._id}`}
            className="h-10 glass-card px-4 text-light-1 flex-center gap-2 rounded-lg hover:bg-white/10 flex-1 transition-all duration-300"
          >
            <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
          </Link>
          <Button
            type="button"
            className="h-10 glass-card px-4 text-light-1 rounded-lg hover:bg-white/10 flex-1 transition-all duration-300"
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
          >
            <p className="flex whitespace-nowrap small-medium">Settings</p>
          </Button>
          <Button type="button" className="h-10 glass-card px-4 text-light-1 rounded-lg hover:bg-white/10 flex-1 transition-all duration-300" onClick={handleShareProfile}>
            <p className="flex whitespace-nowrap small-medium">Share Profile</p>
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            className={`h-10 px-4 text-light-1 flex-center gap-2 rounded-lg flex-1 transition-all duration-300 ${isCurrentlyFollowing
              ? "glass-card hover:bg-white/10"
              : "bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
              }`}
            onClick={handleFollowToggle}
            disabled={isFollowingLoading}
          >
            <p className="flex whitespace-nowrap small-medium">
              {isFollowingLoading
                ? "Loading..."
                : isCurrentlyFollowing
                  ? "Following"
                  : "Follow"
              }
            </p>
          </Button>
          <Button type="button" className="h-10 glass-card px-4 text-light-1 rounded-lg hover:bg-white/10 flex-1 transition-all duration-300" onClick={handleShareProfile}>
            <p className="flex whitespace-nowrap small-medium">Share Profile</p>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="profile-container pb-20 md:pb-8 relative">
      {/* Redirect Banner */}
      {redirectCountdown !== null && (
        <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white text-center py-3 z-[100] font-medium shadow-lg backdrop-blur-md bg-opacity-90 animate-in slide-in-from-top duration-500">
          Sign in to interact with @{currentUser.username}. Redirecting to login in {redirectCountdown}s...
        </div>
      )}
      <div className="flex flex-col w-full max-w-5xl glass-morphism p-8 rounded-3xl border border-white/5 shadow-glass">
        <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
          <Image
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            width={112}
            height={112}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex flex-col items-start w-full">
            <h1 className="text-left text-xl sm:text-2xl font-bold">
              {currentUser.name}
            </h1>
            <p className="text-sm text-light-3 text-left">
              @{currentUser.username}
            </p>

            {/* Privacy indicator */}
            {isOwnProfile && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-light-3">Privacy:</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm">
                    {PRIVACY_SETTINGS.find(setting => setting.value === currentUser.privacy_setting)?.icon || "🌍"}
                  </span>
                  <span className="text-xs text-light-2 capitalize">
                    {PRIVACY_SETTINGS.find(setting => setting.value === currentUser.privacy_setting)?.label || "Public"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 sm:gap-6 mt-3">
              <StatBlock value={isUserLoading ? "..." : userPosts?.length || 0} label="Posts" />
              <StatBlock value={followersCount} label="Followers" />
              <StatBlock value={followingCount} label="Following" />
            </div>
          </div>
        </div>

        <div className="mt-2 w-full">
          <LinkifiedText
            text={currentUser.bio || ""}
            className="text-sm text-left"
          />
        </div>

        <ActionButtons />

        {/* Privacy Settings Section - Only for own profile */}
        {isOwnProfile && showPrivacySettings && (
          <div className="w-full mt-4">
            <PrivacySettings
              currentPrivacy={currentUser.privacy_setting || "public"}
              userId={currentUser.id || currentUser._id || ""}
            />
          </div>
        )}
      </div>

      <div className="flex border-t border-dark-4 w-full max-w-5xl mt-2 pt-2">
        {currentUser._id === user?.id && (
          <div className="flex max-w-5xl w-full">
            <button
              onClick={() => setActiveTab('posts')}
              className={`profile-tab rounded-l-lg ${activeTab === 'posts' && "!bg-dark-3"
                }`}
            >
              <Image src={"/assets/icons/posts.svg"} alt="posts" width={20} height={20} />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`profile-tab rounded-r-lg ${activeTab === 'liked' && "!bg-dark-3"
                }`}
            >
              <Image src={"/assets/icons/like.svg"} alt="like" width={20} height={20} />
              Liked Posts
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl mt-4">
        {activeTab === 'posts' ? (
          <GridPostList posts={userPosts || []} showUser={false} showComments={false} />
        ) : (
          currentUser._id === user?.id && <LikedPosts />
        )}
      </div>
    </div>
  );
};

export default ProfileWrapper;