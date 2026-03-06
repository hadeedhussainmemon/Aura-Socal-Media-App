"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import useDebounce from "@/hooks/useDebounce";
import { searchPostsServer } from "@/lib/actions/post.actions";
import { useGetPosts } from "@/lib/react-query/queriesAndMutations";
import { useInView } from "react-intersection-observer";
import GridPostList from "@/components/shared/GridPostList";
import GridPostSkeleton from "@/components/shared/GridPostSkeleton";
import { Input } from "@/components/ui/input";

import { IPost } from "@/types";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: IPost[];
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return (
      <ul className="grid-container w-full">
        {[...Array(6)].map((_, i) => (
          <GridPostSkeleton key={`search-skeleton-${i}`} />
        ))}
      </ul>
    );
  } else if (searchedPosts && searchedPosts.length > 0) {
    return <GridPostList posts={searchedPosts} />;
  } else {
    return (
      <p className="text-light-4 mt-10 text-center w-full">No results found</p>
    );
  }
};

const Explore = () => {

  const { ref, inView } = useInView();

  const {
    data: postsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetPosts();

  const posts = postsData?.pages.flatMap((page) => page?.documents || []) || [];

  const [searchedPosts, setSearchedPosts] = useState<IPost[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  const [isSearchFetching, setIsSearchFetching] = useState(false);

  useEffect(() => {
    if (inView && hasNextPage && !searchValue) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, searchValue, fetchNextPage]);

  // Handle Search Option

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearch.trim() === "") {
        setSearchedPosts([]);
        setIsSearchFetching(false);
        return;
      }

      try {
        setIsSearchFetching(true);
        const results = await searchPostsServer(debouncedSearch);
        setSearchedPosts(results || []);
      } catch (error) {
        console.error("Failed to search posts", error);
      } finally {
        setIsSearchFetching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearch]);


  if (isLoading && posts.length === 0) {
    return (
      <div className="explore-container">
        <div className="flex flex-wrap gap-9 w-full max-w-5xl mt-16">
          <ul className="grid-container w-full">
            {[...Array(9)].map((_, i) => (
              <GridPostSkeleton key={`explore-skeleton-${i}`} />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Check if there's an error
  if (isError) {
    return (
      <div className="flex-center flex-col w-full h-full gap-4">
        <p className="text-light-4">Failed to load posts</p>
        <button
          onClick={fetchPosts}
          className="shad-button_primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowEmptyMessage = !shouldShowSearchResults && posts.length === 0;

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full aura-text-gradient">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <Image
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold aura-text-gradient">Popular Today</h3>

        <div className="flex gap-3">
          <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
            <p className="small-medium md:base-medium text-light-2">All</p>
            <Image
              src="/assets/icons/filter.svg"
              width={20}
              height={20}
              alt="filter"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowEmptyMessage ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          <GridPostList posts={posts} />
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          {isFetchingNextPage ? (
            <ul className="grid-container w-full max-w-5xl">
              {[...Array(3)].map((_, i) => (
                <GridPostSkeleton key={`explore-skeleton-more-${i}`} />
              ))}
            </ul>
          ) : (
            <div className="h-10 invisible" />
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;
