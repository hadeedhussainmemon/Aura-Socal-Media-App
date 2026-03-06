"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { getSavedPostsServer } from "@/lib/actions/post.actions";

import { IPost } from "@/types";

const Saved = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const [savedPosts, setSavedPosts] = useState<IPost[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoadingSaved(true);
        const posts = await getSavedPostsServer(currentUser.id);

        // Map the saved post documents relative to the post field
        const formattedPosts = posts ? posts.map((save: { post: IPost }) => save.post) : [];
        setSavedPosts(formattedPosts);
      } catch (error) {
        console.error("Failed to fetch saved posts", error);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    if (currentUser?.id) {
      fetchSavedPosts();
    } else {
      setIsLoadingSaved(false);
    }
  }, [currentUser?.id]);

  if (!currentUser) {
    return <Loader />;
  }

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <Image
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {isLoadingSaved ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {!savedPosts || savedPosts.length === 0 ? (
            <p className="text-light-4">No saved posts yet</p>
          ) : (
            <GridPostList posts={savedPosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
