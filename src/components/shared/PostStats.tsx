import { useState, useEffect } from "react";
import Image from "next/image";

import { checkIsLiked } from "@/lib/utils";
import {
  useLikePost,
  useDeleteLike,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations";
import ShareModal from "./ShareModal";
import AuthPromptModal from "./AuthPromptModal";
import { IPost, IUser } from "@/types";

type PostStatsProps = {
  post: IPost;
  userId: string;
  onCommentClick?: () => void;
  showComments?: boolean;
};

const PostStats = ({ post, userId, onCommentClick, showComments = true }: PostStatsProps) => {
  // HOOKS MUST BE AT THE TOP
  const { mutate: likePost } = useLikePost();
  const { mutate: deleteLike } = useDeleteLike();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser(!!userId);

  // Derive likesList safely before hooks that depend on it
  const likesList = post?.likes ? post.likes.map((like: string | IUser) => {
    if (!like) return '';
    if (typeof like === 'string') return like;
    return (like as IUser)?._id || (like as IUser)?.id || '';
  }).filter(Boolean) : [];

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState("");

  // Check if post is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (userId && (currentUser?.id || currentUser?._id) && post?._id) {
        try {
          const savedUsers = post.saves || [];
          const currentUserId = currentUser?.id || currentUser?._id;
          const isCurrentUserSaved = savedUsers.some((id: string) =>
            id.toString() === currentUserId?.toString()
          );
          setIsSaved(isCurrentUserSaved);
        } catch (error) {
          console.error('Error checking saved state:', error);
          setIsSaved(false);
        }
      } else {
        setIsSaved(false);
      }
    };

    checkIfSaved();
  }, [userId, currentUser, post?._id, post?.saves]);

  // EARLY RETURN AFTER HOOKS
  if (!post) return null;

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!userId) {
      setAuthAction("like posts");
      setShowAuthPrompt(true);
      return;
    }

    const postId = post.id || post._id || "";
    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
      setLikes(likesArray);
      deleteLike({ postId, userId });
    } else {
      likesArray.push(userId);
      setLikes(likesArray);
      likePost({ postId, userId });
    }
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!userId) {
      setAuthAction("save posts");
      setShowAuthPrompt(true);
      return;
    }

    const postId = (post as IPost).id || (post as IPost)._id || "";

    if (isSaved) {
      setIsSaved(false);
      return deleteSavePost({ postId, userId });
    }

    savePost({ userId: userId, postId: postId });
    setIsSaved(true);
  };

  const handleSharePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (typeof navigator !== 'undefined' && navigator.share) {
      const postUrl = `${window.location.origin}/posts/${post._id}`;
      const shareText = `Check out this post by ${post.creator?.name}: ${post.caption}`;

      navigator.share({
        title: `Post by ${post.creator?.name}`,
        text: shareText,
        url: postUrl,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <div
        className={`flex justify-between items-center z-20 w-full mb-1`}>
        <div className="flex gap-4">
          {/* Like Button */}
          <div className="flex gap-1 items-center">
            <Image
              src={`${checkIsLiked(likes, userId)
                ? "/assets/icons/liked.svg"
                : "/assets/icons/like.svg"
                }`}
              alt="like"
              width={24}
              height={24}
              onClick={(e) => handleLikePost(e as unknown as React.MouseEvent<HTMLImageElement, MouseEvent>)}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
          </div>

          {/* Comments Button */}
          {showComments && (
            <div className="flex gap-1 items-center">
              <Image
                src="/assets/icons/chat.svg"
                alt="comment"
                width={24}
                height={24}
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={onCommentClick}
              />
            </div>
          )}

          {/* Share Button */}
          <div className="flex gap-1 items-center">
            <Image
              src="/assets/icons/share.svg"
              alt="share"
              width={24}
              height={24}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={(e) => handleSharePost(e as unknown as React.MouseEvent<HTMLImageElement, MouseEvent>)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Image
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={24}
            height={24}
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={(e) => handleSavePost(e as unknown as React.MouseEvent<HTMLImageElement, MouseEvent>)}
          />
        </div>
      </div>

      {likes.length > 0 && (
        <div className="w-full mt-2">
          <p className="text-sm font-semibold text-light-1">{likes.length} {likes.length === 1 ? 'like' : 'likes'}</p>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action={authAction}
      />
    </>
  );
};

export default PostStats;
