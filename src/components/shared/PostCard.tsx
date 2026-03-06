"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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

  if (!post || !post.creator) return null;

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
    setTimeout(() => setShowHeartOverlay(false), 1000);

    likePost({ postId: post._id || post.id as string, userId: user.id });
  };

  return (
    <div className="bg-black sm:bg-dark-2 sm:border sm:border-white/10 sm:rounded-[24px] w-full max-w-screen-sm mb-6 transition-all duration-300 overflow-hidden relative group">
      {/* Mobile Premium Card Design (Inspired by User Image) */}
      <div className="md:hidden relative w-full aspect-[4/5] overflow-hidden rounded-[24px]" onDoubleClick={handleDoubleTap}>
        <Image
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          fill
          className="object-cover"
        />

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <Image src="/assets/icons/search.svg" alt="views" width={14} height={14} className="opacity-70 invert brightness-0" />
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">159k</span>
        </div>

        <div className="absolute top-4 right-4 bg-primary-500 text-[10px] font-bold text-white px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-[0_0_10px_rgba(135,126,255,0.5)]">
          Live
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h3 className="text-light-1 font-bold text-lg mb-1 leading-tight line-clamp-2">{post.caption}</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 shrink-0">
              <Image
                src={post.creator?.imageUrl || post.creator?.image_url || "/assets/icons/profile-placeholder.svg"}
                alt="creator"
                fill
                className="rounded-full border border-white/20 object-cover"
              />
            </div>
            <span className="text-xs text-light-3 font-medium tracking-tight">@{post.creator.username || post.creator.name}</span>
          </div>
        </div>

        {/* Heart Overlay Animation */}
        {showHeartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Image
              src="/assets/icons/liked.svg"
              alt="liked"
              width={100}
              height={100}
              className="drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]"
              style={{ animation: 'heartBurst 0.8s ease-out forwards' }}
            />
          </div>
        )}
      </div>

      {/* Desktop / Standard Design */}
      <div className="hidden md:block">
        <div className="flex-between p-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.creator.username || post.creator._id}`} className="group/avatar relative">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={post.creator?.imageUrl || post.creator?.image_url || "/assets/icons/profile-placeholder.svg"}
                  alt="creator"
                  fill
                  className="rounded-full object-cover border border-white/20"
                />
              </div>
            </Link>

            <div className="flex flex-col">
              <Link href={`/profile/${post.creator.username || post.creator._id}`} className="base-medium text-light-1 hover:text-light-3 transition-colors w-fit">
                {post.creator.name}
              </Link>
              {post.location && (
                <p className="subtle-regular text-light-3">{post.location}</p>
              )}
            </div>
          </div>

          <div className={`flex gap-2 ${user?.id !== post.creator.id && "hidden"}`}>
            <Link href={`/update-post/${post._id}`}>
              <Image src={"/assets/icons/edit.svg"} alt="edit" width={20} height={20} />
            </Link>
            <Button onClick={handleDeletePost} variant="ghost" className="p-0 h-auto">
              <Image src={"/assets/icons/delete.svg"} alt="delete" width={20} height={20} />
            </Button>
          </div>
        </div>

        <div className="relative block w-full cursor-pointer" onDoubleClick={handleDoubleTap}>
          <Image
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            width={600}
            height={600}
            className="w-full object-cover max-h-[600px] select-none"
            priority
          />
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Image src="/assets/icons/liked.svg" alt="liked" width={120} height={120} />
            </div>
          )}
        </div>
      </div>

      {/* Shared Action Bar */}
      <div className="px-4 pt-3 pb-2">
        <PostStats
          post={post}
          userId={user?.id || (user as { _id?: string })?._id || ""}
          onCommentClick={handleCommentClick}
        />
      </div>

      {/* Caption & Tags (Visible on Desktop) */}
      <div className="hidden md:block px-4 pb-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link href={`/profile/${post.creator.username || post.creator._id}`} className="base-medium text-light-1">
            {post.creator.name}
          </Link>
          <span className="small-regular text-light-1">{post.caption}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-light-3 text-sm hover:text-white cursor-pointer transition-colors px-3 py-1 rounded-full bg-white/5 border border-white/5">
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showComments && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <QuickComment
            postId={(post._id || post.id) as string}
            onCommentAdded={() => console.log('Comment added')}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
