"use client";

import Link from "next/link";
import { useState } from "react";
import { multiFormatDateString } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useDeletePost } from "@/lib/react-query/queriesAndMutations";
import { Button } from "@/components/ui/button";
import PostStats from "./PostStats";
import QuickComment from "./QuickComment";
import { POST_CATEGORIES } from "@/constants";

type PostCardProps = {
  post: any; // MongoDB Post document
};

const PostCard = ({ post }: PostCardProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [showComments, setShowComments] = useState(false);
  const { mutate: deletePost } = useDeletePost();

  if (!post.creator) return;

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleDeletePost = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost({ postId: post.id });
    }
  };

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.creator.id}`}>
            <img
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/20"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
              {post.category && (
                <>
                  •
                  <span className="subtle-semibold lg:small-regular text-primary-500 capitalize">
                    {POST_CATEGORIES.find(cat => cat.value === post.category)?.label || post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`flex gap-2 ${user?.id !== post.creator.id && "hidden"}`}>
          <Link href={`/update-post/${post._id}`}>
            <img
              src={"/assets/icons/edit.svg"}
              alt="edit"
              width={20}
              height={20}
              className="hover:scale-110 transition-transform"
            />
          </Link>

          <Button
            onClick={handleDeletePost}
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent"
          >
            <img
              src={"/assets/icons/delete.svg"}
              alt="delete"
              width={20}
              height={20}
              className="hover:scale-110 transition-transform"
            />
          </Button>
        </div>
      </div>

      <Link href={`/posts/${post._id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-primary-500 small-regular hover:underline cursor-pointer">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[24px]">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="post-card_img hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      <PostStats
        post={post}
        userId={(user as any)?.id || (user as any)?._id || ""}
        onCommentClick={handleCommentClick}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-dark-4 pt-4 mt-2">
          <QuickComment
            postId={post._id}
            onCommentAdded={() => {
              // Optionally refresh post data or show success message
              console.log('Comment added successfully!');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
