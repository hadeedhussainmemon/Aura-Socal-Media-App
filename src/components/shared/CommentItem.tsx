"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { multiFormatDateString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CommentForm from "@/components/forms/CommentForm";
import { useLikeComment, useUnlikeComment, useDeleteComment } from "@/lib/react-query/queriesAndMutations";
import Image from "next/image";
import Link from "next/link";

export type CommentType = {
  id: string;
  _id?: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_id?: string | null;
  created_at: string;
  createdAt?: string;
  is_edited: boolean;
  user: {
    id: string;
    _id?: string;
    name: string;
    username: string;
    image_url?: string;
    imageUrl?: string;
  };
  likes?: string[];
  _count?: {
    likes: number;
    replies: number;
  };
  replies?: CommentType[];
};

type CommentItemProps = {
  comment: CommentType;
  onCommentUpdated?: () => void;
  level?: number;
};

const CommentItem = ({ comment, onCommentUpdated, level = 0 }: CommentItemProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment._count?.likes || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Check if user has liked this comment
  useEffect(() => {
    if (user && comment.likes) {
      const userId = user.id || (user as { _id?: string })._id;
      if (userId) {
        setIsLiked(comment.likes.includes(userId));
      }
    }
  }, [user, comment.likes]);

  const { mutateAsync: likeCommentMutate, isPending: isLiking } = useLikeComment();
  const { mutateAsync: unlikeCommentMutate, isPending: isUnliking } = useUnlikeComment();
  const { mutateAsync: deleteCommentMutate, isPending: isDeleting } = useDeleteComment();

  const handleLike = async () => {
    if (!user || isLiking || isUnliking) return;

    const commentId = comment._id || comment.id;
    const userId = user.id || (user as { _id?: string })._id;
    if (!userId) return;

    try {
      if (isLiked) {
        await unlikeCommentMutate({ commentId, userId });
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likeCommentMutate({ commentId, userId });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const handleDelete = async () => {
    const userId = user?.id || (user as { _id?: string })?._id;
    const authorId = comment.user?._id || (comment.user as { id?: string })?.id || comment.user_id;

    if (!user || userId !== authorId || isDeleting) return;

    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteCommentMutate(comment._id || comment.id);
      onCommentUpdated?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleReplyCreated = () => {
    setShowReplyForm(false);
    setShowReplies(true);
    onCommentUpdated?.();
  };

  const isOwner = user?.id === comment.user_id || (user as { _id?: string })?._id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment._count?.replies || 0;

  return (
    <div className={`flex gap-3 ${level > 0 ? 'ml-8' : ''}`}>
      {/* User Avatar */}
      <Link href={`/profile/${comment.user?._id || comment.user.id}`}>
        <Image
          src={comment.user?.imageUrl || comment.user?.image_url || "/assets/icons/profile-placeholder.svg"}
          alt={comment.user?.name || "User"}
          width={level > 0 ? 28 : 32}
          height={level > 0 ? 28 : 32}
          className="rounded-full border border-primary-500/10"
        />
      </Link>

      <div className="flex-1">
        {/* Comment Content */}
        <div className="bg-dark-4 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/profile/${comment.user?._id || comment.user.id}`}
              className="text-sm font-semibold text-light-1 hover:text-primary-500 transition-colors"
            >
              {comment.user?.name}
            </Link>
            <span className="text-xs text-light-4">
              @{comment.user?.username}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-light-4">• edited</span>
            )}
          </div>

          <p className="text-sm text-light-2 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 mt-2 mb-2">
          <span className="text-xs text-light-4">
            {multiFormatDateString(comment.createdAt || comment.created_at)}
          </span>

          {likesCount > 0 && (
            <span className="text-xs text-light-4">
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!user || isLiking}
            className="text-xs text-light-4 hover:text-primary-500 px-1 py-0 h-auto"
          >
            {isLiked ? "Unlike" : "Like"}
          </Button>

          {level === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-light-4 hover:text-primary-500 px-1 py-0 h-auto"
            >
              Reply
            </Button>
          )}

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-400 px-1 py-0 h-auto"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && level === 0 && (
          <div className="mt-2">
            <CommentForm
              postId={comment.post_id}
              parentId={comment.id || comment._id}
              onCommentCreated={handleReplyCreated}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.user.name}...`}
              autoFocus
            />
          </div>
        )}

        {/* Show/Hide Replies Button */}
        {hasReplies && level === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-primary-500 hover:text-primary-400 px-1 py-1 h-auto mb-2"
          >
            {showReplies ? "Hide" : "View"} {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </Button>
        )}

        {/* Replies */}
        {showReplies && hasReplies && level === 0 && (
          <div className="mt-2 space-y-3">
            {comment.replies?.map((reply) => (
              <CommentItem
                key={reply.id || reply._id}
                comment={reply}
                onCommentUpdated={onCommentUpdated}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
