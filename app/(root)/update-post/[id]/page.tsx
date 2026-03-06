"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/shared/Loader";
import { getPostByIdServer } from "@/lib/actions/post.actions";
import { IPost } from "@/types";

const EditPost = () => {
  const params = useParams();
  const id = params?.id;
  const postId = Array.isArray(id) ? id[0] : id;

  const [post, setPost] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        setIsLoading(true);
        const fetchedPost = await getPostByIdServer(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error fetching post for edit:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        {isLoading || !post ? <Loader /> : <PostForm action="Update" post={post} />}
      </div>
    </div>
  );
};

export default EditPost;
