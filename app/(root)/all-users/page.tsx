"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";

import { getAllUsersServer, searchUsersServer } from "@/lib/actions/user.actions";
import { IUser } from "@/types";

const AllUsers = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isError, setIsError] = useState(false);

  // Fetch initial users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const users = await getAllUsersServer(100);
        setAllUsers(users || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setIsError(true);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Search users effect
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearch.trim() === "") {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchUsersServer(debouncedSearch, 50);
        setSearchResults(results || []);
      } catch (error) {
        console.error("Failed to search users", error);
        setIsError(true);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  const isSearchMode = debouncedSearch.trim().length > 0;
  const displayUsers = isSearchMode ? searchResults : allUsers;
  const isLoading = isSearchMode ? isSearching : isLoadingUsers;

  // Filter out current user from the list
  const otherUsers = displayUsers?.filter((creator: IUser) => creator._id !== user?.id) || [];

  if (isError) {
    toast({ title: "Something went wrong fetching users.", variant: "destructive" });
  }

  return (
    <div className="common-container">
      <div className="user-container max-w-5xl w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="h3-bold md:h2-bold text-left aura-text-gradient">Discover Creators</h2>
            <p className="text-light-3 text-sm">Find and follow interesting people in the community</p>
          </div>

          {/* Premium Search Bar */}
          <div className="w-full md:max-w-md relative group">
            <div className="absolute inset-0 bg-primary-500/5 blur-xl group-focus-within:bg-primary-500/10 transition-all duration-300" />
            <div className="relative flex items-center gap-3 w-full h-12 glass-morphism rounded-2xl px-5 border border-white/5 transition-all duration-300 focus-within:border-primary-500/30 focus-within:shadow-glow">
              <Image
                src="/assets/icons/search.svg"
                width={20}
                height={20}
                alt="search"
                className="opacity-50 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all"
              />
              <Input
                type="text"
                placeholder="Search by name or username..."
                className="flex-1 h-full bg-transparent border-none outline-none text-white placeholder:text-light-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="text-light-4 hover:text-white transition-colors p-1"
                  type="button"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full">
          {isLoading && displayUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader />
              <p className="text-light-3 animate-pulse">Scanning the Aura universe...</p>
            </div>
          ) : (
            <>
              {/* Search Progress Info */}
              {isSearchMode && (
                <div className="mb-8 flex items-center gap-3 text-light-3 text-sm px-2 animate-in fade-in slide-in-from-left-4 duration-500">
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                      <span>Searching for ghosts...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                      <span>Found <span className="text-light-1 font-bold">{otherUsers.length}</span> creators matching <span className="px-2 py-0.5 rounded-md bg-white/5 text-primary-500 font-medium">@{debouncedSearch}</span></span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {otherUsers?.length > 0 ? (
                  otherUsers.map((creator: IUser) => (
                    <div key={creator?._id || creator.id} className="w-full animate-in fade-in zoom-in-95 duration-500">
                      <UserCard user={creator} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 text-center glass-morphism rounded-[40px] border border-white/5 mx-2">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full" />
                      <Image
                        src="/assets/icons/people.svg"
                        width={100}
                        height={100}
                        alt="no users"
                        className="relative opacity-20 filter grayscale"
                      />
                    </div>
                    <p className="text-xl font-bold text-light-2 mb-2">
                      {isSearchMode ? "No Aura Matches Found" : "A Bit Quiet Here..."}
                    </p>
                    <p className="text-light-4 text-sm max-w-xs mx-auto leading-relaxed">
                      {isSearchMode
                        ? `We couldn't find anyone matching "${debouncedSearch}". Maybe try a different frequency?`
                        : "The universe is expanding. Check back later to see new travelers joining Aura."
                      }
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
