"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { multiFormatDateString } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useDeletePost, useLikePost } from "@/lib/react-query/queriesAndMutations";
import { Button } from "@/components/ui/button";
import PostStats from "./PostStats";
import QuickComment from "./QuickComment";

import { IPost } from "@/types";

type PostCardProps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [showComments, setShowComments] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const { mutate: deletePost } = useDeletePost();
  const { mutate: likePost } = useLikePost();

  if (!post.creator) return null;

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleDeletePost = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost({ postId: post.id || post._id as string });
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000); // Hide after 1s

    // Add like
    likePost({ postId: post._id || post.id as string, userId: user.id });
  };

  return (
    <div className="bg-black sm:bg-dark-2 sm:border sm:border-white/10 sm:rounded-[8px] w-full max-w-screen-sm mb-6 transition-all duration-300">
      {/* Header (Avatar & Name) */}
      <div className="flex-between p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.creator.username || post.creator._id}`} className="group/avatar relative">
            <Image
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              width={36}
              height={36}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20"
            />
          </Link>

          <div className="flex flex-col">
            <Link href={`/profile/${post.creator.username || post.creator._id}`} className="base-medium text-light-1 hover:text-light-3 transition-colors w-fit">
              {post.creator.name}
            </Link>
            {post.location && (
              <p className="subtle-regular text-light-3">
                {post.location}
              </p>
            )}
          </div>
        </div>

        <div className={`flex gap-2 ${user?.id !== post.creator.id && "hidden"}`}>
          <Link href={`/update-post/${post._id}`}>
            <Image
              src={"/assets/icons/edit.svg"}
              alt="edit"
              width={20}
              height={20}
              className="hover:opacity-70 transition-opacity"
            />
          </Link>

          <Button
            onClick={handleDeletePost}
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent hover:opacity-70 transition-opacity"
          >
            <Image
              src={"/assets/icons/delete.svg"}
              alt="delete"
              width={20}
              height={20}
            />
          </Button>
        </div>
      </div>

      {/* Full-width Image with Double Tap */}
      <div
        className="relative block w-full cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <Image
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          width={600}
          height={600}
          className="w-full object-cover sm:rounded-none max-h-[600px] select-none"
          priority
        />

        {/* Heart Overlay Animation */}
        {showHeartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Image
              src="/assets/icons/liked.svg"
              alt="liked"
              width={120}
              height={120}
              className="drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]"
              style={{ animation: 'heartBurst 0.8s ease-out forwards' }}
            />
          </div>
        )}
      </div>

      {/* Action Bar (Like/Comment/Share/Save) */}
      <div className="px-3 sm:px-4 pt-3 pb-2">
        <PostStats
          post={post}
          userId={user?.id || (user as { _id?: string })?._id || ""}
          onCommentClick={handleCommentClick}
        />
      </div>

      {/* Caption & Tags */}
      <div className="px-3 sm:px-4 pb-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link href={`/profile/${post.creator.username || post.creator._id}`} className="base-medium text-light-1 hover:text-light-3 transition-colors">
            {post.creator.name}
          </Link>
          <span className="small-regular text-light-1">{post.caption}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1 mt-1">
            {post.tags.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-light-3 text-sm hover:text-white cursor-pointer transition-colors">
                #{tag}
              </li>
            ))}
          </ul>
        )}

        {/* Timestamp */}
        <p className="text-[11px] text-light-3 uppercase mt-2 font-medium tracking-wide">
          {multiFormatDateString(post.createdAt)}
        </p>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 sm:px-4 pb-4 border-t border-white/5 pt-3">
          <QuickComment
            postId={(post._id || post.id) as string}
            onCommentAdded={() => {
              console.log('Comment added successfully!');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
