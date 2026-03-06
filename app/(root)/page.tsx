"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { getRecentPostsServer } from "@/lib/actions/post.actions";
import { getAllUsersServer } from "@/lib/actions/user.actions";

import { IPost, IUser } from "@/types";

const Home = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [posts, setPosts] = useState<IPost[]>([]);
  const [creators, setCreators] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [recentPosts, allUsers] = await Promise.all([
          getRecentPostsServer(),
          getAllUsersServer(10)
        ]);

        setPosts(recentPosts || []);
        setCreators(allUsers || []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Filter out current user from creators list
  const otherUsers = creators?.filter((creator: IUser) => creator._id !== user?.id) || [];

  if (isError) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-1 w-full">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Following Feed</h2>
          {isLoading && !posts.length ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts && posts.length > 0 ? (
                posts.map((post: IPost) => (
                  <li key={post._id} className="flex justify-center w-full">
                    <PostCard post={post} />
                  </li>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-dark-3 flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-light-4">
                      <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 14C16.4183 14 20 17.5817 20 22H4C4 17.5817 7.58172 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-light-2 text-lg font-semibold mb-2">Your feed is empty</h3>
                  <p className="text-light-4 text-sm mb-4 max-w-sm">
                    Follow other people to see their posts in your feed, or create your first post!
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="/explore"
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                    >
                      Explore Posts
                    </a>
                    <span className="text-light-4">•</span>
                    <a
                      href="/all-users"
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                    >
                      Find People
                    </a>
                    <span className="text-light-4">•</span>
                    <a
                      href="/create-post"
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                    >
                      Create Post
                    </a>
                  </div>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="home-creators">
        <h3 className="h3-bold text-light-1">People You Might Know</h3>
        {isLoading && !creators.length ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {otherUsers && otherUsers.length > 0 ? (
              otherUsers.map((creator: IUser) => (
                <li key={creator?._id}>
                  <UserCard user={creator} />
                </li>
              ))
            ) : (
              <p className="text-light-4">No other users yet</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
