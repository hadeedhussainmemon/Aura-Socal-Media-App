"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { multiFormatDateString } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useDeletePost } from "@/lib/react-query/queriesAndMutations";
import { Button } from "@/components/ui/button";
import PostStats from "./PostStats";
import QuickComment from "./QuickComment";
import { POST_CATEGORIES } from "@/constants";

import { IPost } from "@/types";

type PostCardProps = {
  post: IPost;
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
    <div className="post-card glass-morphism shadow-glass overflow-hidden rounded-[24px] border border-white/5 hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 group/card">
      <div className="flex-between p-5 pb-0">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.creator.username || post.creator.id}`} className="group/avatar relative">
            <Image
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover/avatar:border-primary-500/60 shadow-lg transition-colors duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-purple-500/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </Link>

          <div className="flex flex-col">
            <Link href={`/profile/${post.creator.username || post.creator.id}`} className="base-medium lg:body-bold text-light-1 group-hover/card:aura-text-gradient transition-colors duration-300 w-fit">
              {post.creator.name}
            </Link>
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
            <Image
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
            <Image
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
        <div className="small-medium lg:base-medium py-5 text-light-2 group-hover/card:text-light-1 transition-colors duration-300">
          <p>{post.caption}</p>
          <ul className="flex flex-wrap gap-1 mt-2">
            {post.tags?.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-primary-500 small-regular hover:text-primary-400 hover:underline cursor-pointer transition-colors">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[24px]">
          <Image
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            width={600}
            height={400}
            className="post-card_img hover:scale-105 transition-transform duration-500 object-cover"
          />
        </div>
      </Link>

      <PostStats
        post={post}
        userId={user?.id || (user as { _id?: string })?._id || ""}
        onCommentClick={handleCommentClick}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-dark-4 pt-4 mt-2">
          <QuickComment
            postId={(post._id || post.id) as string}
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
