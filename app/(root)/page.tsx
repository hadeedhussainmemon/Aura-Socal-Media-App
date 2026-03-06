"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PostCard from "@/components/shared/PostCard";
import SuggestionRow from "@/components/shared/SuggestionRow";
import PostSkeleton from "@/components/shared/PostSkeleton";
import { useGetPosts, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useInView } from "react-intersection-observer";

import { IPost, IUser } from "@/types";

const Home = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const { ref, inView } = useInView();

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetPosts();

  const { data: creatorsData, isLoading: isCreatorsLoading, isError: isCreatorsError } = useGetUsers(10);

  const posts = postsData?.pages.flatMap((page) => page?.documents || []) || [];
  const creators = creatorsData?.documents || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Filter out current user from creators list
  const otherUsers = creators?.filter((creator: IUser) => creator._id !== user?.id) || [];

  const isError = isPostsError || isCreatorsError;

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
          <h2 className="h3-bold md:h2-bold text-left w-full aura-text-gradient">Following Feed</h2>
          {isPostsLoading && !posts.length ? (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {[...Array(3)].map((_, i) => (
                <li key={`skeleton-${i}`} className="flex justify-center w-full">
                  <PostSkeleton />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts && posts.length > 0 ? (
                posts.map((post: IPost) => (
                  <li key={post._id || post.id} className="flex justify-center w-full">
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
              {isFetchingNextPage && (
                <div className="flex justify-center w-full mt-4">
                  <PostSkeleton />
                </div>
              )}
              {hasNextPage && <div ref={ref} className="h-10 invisible" />}
            </ul>
          )}
        </div>
      </div>
      <div className="home-creators">
        <div className="flex-between w-full mb-4">
          <h3 className="base-bold text-light-3">Suggestions For You</h3>
          <Link href="/all-users" className="small-semibold text-primary-500 hover:text-light-1 transition-colors">
            See All
          </Link>
        </div>

        {isCreatorsLoading && !creators.length ? (
          <div className="flex flex-col gap-4 w-full">
            {[...Array(5)].map((_, i) => (
              <div key={`sugg-skeleton-${i}`} className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-dark-4 animate-pulse" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 w-24 bg-dark-4 rounded animate-pulse" />
                  <div className="h-2 w-32 bg-dark-4 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {otherUsers && otherUsers.length > 0 ? (
              otherUsers.slice(0, 5).map((creator: IUser) => (
                <SuggestionRow key={creator?._id} user={creator} />
              ))
            ) : (
              <p className="text-light-4 text-xs">No suggestions available</p>
            )}
          </div>
        )}

        {/* Footer links similar to Instagram */}
        <div className="mt-10 flex flex-wrap gap-x-2 gap-y-1 opacity-50">
          {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language'].map((link) => (
            <span key={link} className="text-[10px] text-light-3 hover:underline cursor-pointer">{link}</span>
          ))}
        </div>
        <p className="mt-6 text-[10px] text-light-3 opacity-50 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} AURA FROM HADEED
        </p>
      </div>
    </div>
  );
};

export default Home;
