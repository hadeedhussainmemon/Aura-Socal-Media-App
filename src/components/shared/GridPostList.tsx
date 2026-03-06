"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import PostStats from "./PostStats";
import { IPost } from "@/types";

type GridPostListProps = {
  posts: IPost[]; // Posts array
  showUser?: boolean;
  showStats?: boolean;
  showComments?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  showComments = true,
}: GridPostListProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li key={post.id || post._id} className="relative min-w-80 h-80 rounded-3xl overflow-hidden border border-white/5 shadow-glass group/griditem hover:-translate-y-1 hover:shadow-2xl hover:border-white/10 transition-all duration-500">
          <Link href={`/posts/${post.id || post._id}`} className="grid-post_link">
            <Image
              src={post.imageUrl || ""}
              alt="post"
              width={400}
              height={400}
              className="h-full w-full object-cover group-hover/griditem:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Subtle overlay gradient on hover for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-1/80 via-transparent to-transparent opacity-60 group-hover/griditem:opacity-80 transition-opacity duration-500"></div>
          </Link>

          <div className="grid-post_user absolute bottom-0 w-full p-4 flex-between z-10">
            {showUser && (
              <Link href={`/profile/${post.creator?.username || post.creator?.id}`} className="flex items-center justify-start gap-2 flex-1 hover:opacity-80 transition-opacity group/user">
                <Image
                  src={
                    post.creator?.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover/user:border-primary-500/50 transition-colors"
                />
                <p className="line-clamp-1 text-light-1 small-medium group-hover/user:aura-text-gradient font-semibold drop-shadow-md">{post.creator?.name}</p>
              </Link>
            )}
            {showStats && (
              <PostStats
                post={post}
                userId={user?.id || (user as { _id?: string })?._id || ""}
                showComments={showComments}
                onCommentClick={() => {
                  // For grid view, navigate to post detail page for comments
                  window.location.href = `/posts/${post.id || post._id}`;
                }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;
