"use client";

import Link from "next/link";
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
        <li key={post.id || post._id} className="relative min-w-80 h-80">
          <Link href={`/posts/${post.id || post._id}`} className="grid-post_link">
            <img
              src={post.imageUrl}
              alt="post"
              className="h-full w-full object-cover"
            />
          </Link>

          <div className="grid-post_user">
            {showUser && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={
                    post.creator?.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 rounded-full"
                />
                <p className="line-clamp-1">{post.creator?.name}</p>
              </div>
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
