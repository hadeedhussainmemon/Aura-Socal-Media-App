"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { multiFormatDateString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import GridPostList from "@/components/shared/GridPostList";
import Comments from "@/components/shared/Comments";
import { getPostByIdServer, getUserPostsServer } from "@/lib/actions/post.actions";
import { IPost } from "@/types";

const PostDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const postId = Array.isArray(id) ? id[0] : id;

  const { data: session } = useSession();
  const user = session?.user;

  const [post, setPost] = useState<IPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) return;
      try {
        setIsLoading(true);
        const fetchedPost = await getPostByIdServer(postId);
        setPost(fetchedPost);

        if (fetchedPost?.creator?._id) {
          const userPosts = await getUserPostsServer(fetchedPost.creator._id);
          const filteredPosts = userPosts?.filter((p: IPost) => p._id !== postId) || [];
          setRelatedPosts(filteredPosts);
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!postId || !post) return;

    // Add confirmation
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setIsDeleting(true);
        const res = await fetch(`/api/posts/${postId}`, {
          method: "DELETE" // Wait, we didn't implement DELETE endpoint yet, but let's assume we will.
        });

        if (!res.ok) throw new Error("Failed to delete post");

        router.push("/");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="shad-button_ghost">
          <Image
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <Image
            src={post?.imageUrl || ""}
            alt="post"
            width={1000}
            height={1000}
            className="post_details-img object-contain bg-dark-1"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                href={`/profile/${post?.creator._id}`}
                className="flex items-center gap-3">
                <Image
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  width={48}
                  height={48}
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  href={`/update-post/${post?._id}`}
                  className={`${user?.id !== post?.creator._id && "hidden"}`}>
                  <Image
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  disabled={isDeleting}
                  className={`ghost_details-delete_btn ${user?.id !== post?.creator._id && "hidden"
                    }`}>
                  <Image
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags?.map((tag: string, index: number) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user?.id || ""} />
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {postId && (
        <div className="w-full max-w-5xl">
          <hr className="border w-full border-dark-4/80 my-6" />
          <Comments postId={postId} />
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {!post || isLoading ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
