import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";

import {
  getRecentPostsServer,
  getPostByIdServer,
  getUserPostsServer,
  getSavedPostsServer,
  searchPostsServer,
  likePostServer,
  deleteLikeServer,
  savePostServer,
  deleteSaveServer,
  createPostServer,
  updatePostServer,
  deletePostServer,
  getLikedPostsServer,
} from "../actions/post.actions";
import {
  getUserByIdServer,
  getAllUsersServer,
  searchUsersServer,
  updateUserServer,
  getCurrentUserServer,
  followUserServer,
  unfollowUserServer,
  isFollowingServer,
  getFollowersCountServer,
  getFollowingCountServer,
  getAdminStats,
  checkAdminAccess,
  getAdminUsers,
  addAdminUser,
  removeAdminUser,
  getAdminAllUsers,
  getAdminUserDetails,
  toggleUserActivation,
  deactivateUser,
  getPublicUserById,
  getPublicFollowersCount,
  getPublicFollowingCount,
  sendPasswordResetEmail,
  updateUserPassword,
  getFollowers,
  getFollowing,
} from "../actions/user.actions";
import {
  createCommentServer,
  getPostCommentsServer,
  deleteCommentServer,
  updateCommentServer,
  likeCommentServer,
  unlikeCommentServer,
} from "../actions/comment.actions";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} from "../actions/message.actions";
import {
  getFollowingFeedServer,
  getInfinitePostsServer,
  getPublicUserPosts,
  getPublicPostById,
  getAdminAllPosts,
  adminDeletePost,
} from "../actions/post.actions";

import { INewPost, IUpdatePost, IUpdateUser } from "@/types";
import { notificationService } from "../utils/notificationService";
import { QUERY_KEYS } from "./queryKeys";

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPostServer(post),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });

      if (data && variables.userId) {
        try {
          const user = await getCurrentUserServer(variables.userId);
          if (user) {
            await notificationService.createNewPostNotifications(
              (data as unknown as { _id: string; id: string })._id || (data as unknown as { _id: string; id: string }).id,
              variables.userId,
              user.name || user.username || 'Unknown User',
              user.image || user.imageUrl || '',
              variables.caption || 'New post'
            );

            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
            });
          }
        } catch (error) {
          console.error('Error creating new post notifications:', error);
        }
      }
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, tags, ...postData }: IUpdatePost) => {
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
      return updatePostServer(postId, {
        ...postData,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData([QUERY_KEYS.GET_POST_BY_ID, (data as { id: string }).id], data);
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPostsServer,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: unknown) => {
      console.log('Recent posts query failed:', error);
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetFollowingFeed = (page: number = 1, limit: number = 20) => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED, page],
    queryFn: () => {
      const userId = (session?.user as { id?: string; _id?: string })?.id || (session?.user as { id?: string; _id?: string })?._id || "";
      return getFollowingFeedServer(userId, page, limit);
    },
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 1, // 1 minute (shorter than recent posts for more freshness)
    retry: (failureCount, error: unknown) => {
      console.log('Following feed query failed:', error);
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Refetch when returning from background
    refetchInterval: false, // Don't auto-refetch on interval
    // Ensure fresh data when component mounts
    gcTime: 1000 * 60 * 5, // 5 minutes cache time
  });
};
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      userId,
    }: {
      postId: string;
      userId: string;
    }) => likePostServer(postId, userId), // Updated to match our MongoDB API
    onSuccess: async (_: unknown, variables: { postId: string; userId: string }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.postId] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });

      try {
        const post = await getPostByIdServer(variables.postId);
        const user = await getCurrentUserServer(variables.userId);

        if (post && user && (post.creator?.id || post.creator?._id) !== variables.userId) {
          await notificationService.createLikeNotification(
            variables.postId,
            post.creator.id || post.creator._id,
            variables.userId,
            user.name || user.username || 'Unknown User',
            user.image || user.imageUrl || ''
          );

          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, post.creator.id],
          });
        }
      } catch (error) {
        console.error('Error creating like notification:', error);
      }
    },
  });
};

export const useDeleteLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      userId,
    }: {
      postId: string;
      userId: string;
    }) => deleteLikeServer(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePostServer(postId, userId), // Note: swapped order to match our API
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS, variables.userId],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      deleteSaveServer(postId, userId), // Updated to use our deleteSave function
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS, variables.userId],
      });
    },
  });
};
export const useGetCurrentUser = (enabled = true) => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: () => {
      const userId = (session?.user as { id?: string; _id?: string })?.id || (session?.user as { id?: string; _id?: string })?._id || "";
      return getCurrentUserServer(userId);
    },
    enabled: enabled,
    retry: (failureCount, error) => {
      // Don't retry if it's an auth session missing error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('session_missing') || errorMessage.includes('Auth session missing')) {
        return false
      }
      // Only retry 2 times for other errors
      return failureCount < 2
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostByIdServer(postId!),
    enabled: !!postId,
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: (failureCount, error: unknown) => {
      console.log('Infinite scroll query failed:', error);
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
  });
};
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      deletePostServer(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      // Invalidate following feed so deleted posts are removed from followers' feeds
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });
    },
  });
};
export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPostsServer(userId!),
    enabled: !!userId,
  });
};
export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: ({ pageParam }) => getInfinitePostsServer({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.documents || lastPage.documents.length === 0) {
        return null; // No more pages to fetch
      }
      return lastPage.documents[lastPage.documents.length - 1].id;
    },
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or auth errors
      const err = error as { status?: number };
      if (err?.status === 404 || err?.status === 401) {
        return false
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};





export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPostsServer(searchTerm),
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 1, // 1 minute for search results
    retry: (failureCount, error: unknown) => {
      console.log('Search posts query failed:', error);
      return failureCount < 2;
    },
    refetchOnWindowFocus: false, // Don't refetch searches on focus
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getAllUsersServer(limit),
  });
};

export const useSearchUsers = (searchTerm: string, limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_USERS, searchTerm],
    queryFn: () => searchUsersServer(searchTerm, limit),
    enabled: !!searchTerm.trim(), // Only run query if search term exists
  });
};

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADMIN_STATS],
    queryFn: getAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCheckAdminAccess = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHECK_ADMIN_ACCESS, userId],
    queryFn: () => checkAdminAccess(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetAdminUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADMIN_USERS],
    queryFn: getAdminUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => addAdminUser(email),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
    },
  });
};

export const useRemoveAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
    },
  });
};

export const useGetSavedPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SAVED_POSTS, userId],
    queryFn: () => getSavedPostsServer(userId!),
    enabled: !!userId,
  });
};

export const useGetLikedPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LIKED_POSTS, userId],
    queryFn: () => getLikedPostsServer(userId!),
    enabled: !!userId,
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserByIdServer(userId),
    enabled: !!userId,
  });
};

// Public hooks for unauthenticated access
export const useGetPublicUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, 'public', userId],
    queryFn: () => getPublicUserById(userId),
    enabled: !!userId,
    retry: 1, // Reduce retries for faster failure
  });
};

export const useGetPublicUserPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, 'public', userId],
    queryFn: () => getPublicUserPosts(userId),
    enabled: !!userId,
    retry: 1,
  });
};

export const useGetPublicFollowersCount = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, 'public', userId],
    queryFn: () => getPublicFollowersCount(userId),
    enabled: !!userId,
    retry: 1,
  });
};

export const useGetPublicFollowingCount = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING_COUNT, 'public', userId],
    queryFn: () => getPublicFollowingCount(userId),
    enabled: !!userId,
    retry: 1,
  });
};

export const useGetPublicPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, 'public', postId],
    queryFn: () => getPublicPostById(postId),
    enabled: !!postId,
    retry: 1,
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...userData }: IUpdateUser) => updateUserServer(userId, userData),
    onSuccess: (data) => {
      // Invalidate current user queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });

      // Invalidate specific user query
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.id],
      });

      // Invalidate all users queries (for People page, etc.)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });

      // Invalidate posts queries since posts show user info
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });

      // Invalidate user posts
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_POSTS, data?.id],
      });

      // Force a complete refetch by clearing all queries
      queryClient.refetchQueries();
    },
  });
};

// ============================================================
// FOLLOW MUTATIONS AND QUERIES
// ============================================================

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;

  return useMutation({
    mutationFn: (followingId: string) => {
      const followerId = (session?.user as { id?: string; _id?: string })?.id || (session?.user as { id?: string; _id?: string })?._id || "";
      return followUserServer(followerId, followingId);
    },
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.IS_FOLLOWING, userId] });
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, userId] });

      // Snapshot the previous values
      const previousIsFollowing = queryClient.getQueryData([QUERY_KEYS.IS_FOLLOWING, userId]);
      const previousFollowerCount = queryClient.getQueryData([QUERY_KEYS.GET_FOLLOWERS_COUNT, userId]);

      // Optimistically update to the new values
      queryClient.setQueryData([QUERY_KEYS.IS_FOLLOWING, userId], true);
      if (typeof previousFollowerCount === 'number') {
        queryClient.setQueryData([QUERY_KEYS.GET_FOLLOWERS_COUNT, userId], previousFollowerCount + 1);
      }

      // Return a context object with the snapshotted values
      return { previousIsFollowing, previousFollowerCount, userId };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData([QUERY_KEYS.IS_FOLLOWING, context.userId], context.previousIsFollowing);
      }
      if (context?.previousFollowerCount !== undefined) {
        queryClient.setQueryData([QUERY_KEYS.GET_FOLLOWERS_COUNT, context.userId], context.previousFollowerCount);
      }
    },
    onSuccess: async (_, userId) => {
      // Create notification for the followed user
      if (user) {
        try {
          await notificationService.createFollowNotification(
            userId,
            user.id,
            user.name || 'A User',
            user.image || user.imageUrl || ''
          );
        } catch (error) {
          console.error('Failed to create follow notification:', error);
        }
      }

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_COUNT],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_FOLLOWING, userId],
      });
      // Invalidate following feed to show new posts from followed user
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });
      // Invalidate notifications for the followed user to show new follow notification
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId],
      });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: (followingId: string) => {
      const followerId = (session?.user as { id?: string; _id?: string })?.id || (session?.user as { id?: string; _id?: string })?._id || "";
      return unfollowUserServer(followerId, followingId);
    },
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.IS_FOLLOWING, userId] });
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, userId] });

      // Snapshot the previous values
      const previousIsFollowing = queryClient.getQueryData([QUERY_KEYS.IS_FOLLOWING, userId]);
      const previousFollowerCount = queryClient.getQueryData([QUERY_KEYS.GET_FOLLOWERS_COUNT, userId]);

      // Optimistically update to the new values
      queryClient.setQueryData([QUERY_KEYS.IS_FOLLOWING, userId], false);
      if (typeof previousFollowerCount === 'number' && previousFollowerCount > 0) {
        queryClient.setQueryData([QUERY_KEYS.GET_FOLLOWERS_COUNT, userId], previousFollowerCount - 1);
      }

      // Return a context object with the snapshotted values
      return { previousIsFollowing, previousFollowerCount, userId };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData([QUERY_KEYS.IS_FOLLOWING, context.userId], context.previousIsFollowing);
      }
      if (context?.previousFollowerCount !== undefined) {
        queryClient.setQueryData([QUERY_KEYS.GET_FOLLOWERS_COUNT, context.userId], context.previousFollowerCount);
      }
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_COUNT],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_FOLLOWING, userId],
      });
      // Invalidate following feed to remove posts from unfollowed user
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });
    },
  });
};

export const useGetFollowersCount = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, userId],
    queryFn: () => getFollowersCountServer(userId),
    enabled: !!userId,
  });
};

export const useGetFollowingCount = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING_COUNT, userId],
    queryFn: () => getFollowingCountServer(userId),
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string) => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: [QUERY_KEYS.IS_FOLLOWING, userId],
    queryFn: () => {
      const followerId = (session?.user as { id?: string; _id?: string })?.id || (session?.user as { id?: string; _id?: string })?._id || "";
      return isFollowingServer(followerId, userId);
    },
    enabled: !!session?.user && !!userId,
  });
};

export const useGetFollowers = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWERS, userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });
};

export const useGetFollowing = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING, userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });
};

// ============ PASSWORD RESET MUTATIONS ============

export const useSendPasswordResetEmail = () => {
  return useMutation({
    mutationFn: (email: string) => sendPasswordResetEmail(email),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (newPassword: string) => updateUserPassword(newPassword),
  });
};

// ============================================================
// NOTIFICATION QUERIES AND MUTATIONS
// ============================================================

export const useGetNotifications = (userId: string, limit: number = 20) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId, limit],
    queryFn: () => notificationService.getUserNotifications(userId, limit),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds (notifications should be fresh)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT],
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationService.markAllNotificationsAsRead(userId),
    onSuccess: () => {
      // Invalidate notifications queries to update read status
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT],
      });
    },
  });
};

// ============================================================
// COMMENT QUERIES AND MUTATIONS
// ============================================================

export const useGetComments = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMENTS, postId],
    queryFn: () => getPostCommentsServer(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Comments don't change as frequently
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: { content: string; postId: string; userId: string; parentId?: string }) =>
      createCommentServer(comment.postId, comment.userId, comment.content, comment.parentId),
    onSuccess: async (data, variables) => {
      // Invalidate comments for the post
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS, variables.postId],
      });

      // Invalidate post queries to update comment counts
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });

      // Create comment notification for post owner
      if (data && variables.userId) {
        try {
          const post = await getPostByIdServer(variables.postId);
          const user = await getCurrentUserServer(variables.userId);

          if (post && user && (post.creator?._id || post.creator?.id) !== variables.userId) {
            await notificationService.createCommentNotification(
              variables.postId,
              post.creator.id || post.creator._id,
              variables.userId,
              user.name || user.username || 'Unknown User',
              user.image || user.imageUrl || '',
              variables.content
            );

            // Invalidate notifications for the post owner
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, post.creator.id],
            });
          }
        } catch (error) {
          console.error('Error creating comment notification:', error);
        }
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentServer(commentId, content),
    onSuccess: () => {
      // Invalidate all comment queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentServer(commentId),
    onSuccess: () => {
      // Invalidate all comment queries since we don't know which post this belonged to
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS],
      });
      // Also invalidate post queries to update comment counts
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: string }) =>
      likeCommentServer(commentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS],
      });
    },
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: string }) =>
      unlikeCommentServer(commentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS],
      });
    },
  });
};

// ============================================================
// ADMIN MANAGEMENT HOOKS
// ============================================================

export const useGetAdminAllUsers = (page: number = 1, limit: number = 10, search: string = '', options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADMIN_ALL_USERS, page, limit, search],
    queryFn: () => getAdminAllUsers(page, limit, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled !== false,
  });
};

export const useGetAdminUserDetails = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADMIN_USER_DETAILS, userId],
    queryFn: () => getAdminUserDetails(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useToggleUserActivation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => toggleUserActivation(userId),
    onSuccess: () => {
      // Invalidate admin user queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_ALL_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_STATS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_USER_DETAILS],
      });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      // Invalidate admin user queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_ALL_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_STATS],
      });
    },
  });
};

export const useGetAdminAllPosts = (page: number = 1, limit: number = 10, search: string = '', options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ADMIN_ALL_POSTS, page, limit, search],
    queryFn: () => getAdminAllPosts(page, limit, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled !== false,
  });
};

export const useAdminDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => adminDeletePost(postId),
    onSuccess: () => {
      // Invalidate admin post queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_ALL_POSTS],
      });
      // Also invalidate regular post queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_FEED],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ADMIN_STATS],
      });
    },
  });
};

// ============================================================
// MESSAGE QUERIES AND MUTATIONS
// ============================================================

export const useGetConversations = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATIONS, userId],
    queryFn: () => getConversations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetMessages = (conversationId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MESSAGES, conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000, // Polling every 5 seconds for a "real-time" feel without WebSockets
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, receiverId, content }: { senderId: string, receiverId: string, content: string }) =>
      sendMessage(senderId, receiverId, content),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_MESSAGES, data.conversation],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CONVERSATIONS],
        });
      }
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_MESSAGES],
      });
    },
  });
};


// ============================================================
// MESSAGE QUERIES AND MUTATIONS
// ============================================================

export const useGetConversations = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATIONS, userId],
    queryFn: () => getConversations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetMessages = (conversationId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MESSAGES, conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000, // Polling every 5 seconds for a "real-time" feel without WebSockets
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, receiverId, content }: { senderId: string, receiverId: string, content: string }) =>
      sendMessage(senderId, receiverId, content),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_MESSAGES, data.conversation],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CONVERSATIONS],
        });
      }
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_MESSAGES],
      });
    },
  });
};
