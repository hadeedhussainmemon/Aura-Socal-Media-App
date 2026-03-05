"use client";

import { useSession } from "next-auth/react";
import CommentForm from "@/components/forms/CommentForm";
import CommentItem, { CommentType } from "@/components/shared/CommentItem";
import Loader from "@/components/shared/Loader";
import { useGetComments } from "@/lib/react-query/queriesAndMutations";

type CommentsProps = {
  postId: string;
  className?: string;
};

const Comments = ({ postId, className = "" }: CommentsProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: comments = [], isLoading } = useGetComments(postId);
  const commentsCount = comments.length;

  const handleCommentCreated = () => {
    // React query handles invalidation automatically on success
  };

  const handleCommentUpdated = () => {
    // React query handles invalidation automatically on success
  };

  return (
    <div className={`comments-section ${className}`}>
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-light-1">
          {commentsCount === 0
            ? "No comments yet"
            : `${commentsCount} ${commentsCount === 1 ? "comment" : "comments"}`
          }
        </h3>
      </div>

      {/* Comment Form */}
      {user && (
        <div className="mb-6">
          <CommentForm
            postId={postId}
            onCommentCreated={handleCommentCreated}
            placeholder="Add a comment..."
          />
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: CommentType) => (
            <CommentItem
              key={comment.id || comment._id}
              comment={comment}
              onCommentUpdated={handleCommentUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-light-4">
          <p>Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default Comments;
