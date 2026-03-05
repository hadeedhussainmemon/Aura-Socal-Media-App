import React from 'react';
import { useParams } from 'next/navigation';
import GridPostList from '@/components/shared/GridPostList';
import { useGetLikedPosts } from '@/lib/react-query/queriesAndMutations';
import Loader from '@/components/shared/Loader';

const LikedPosts = () => {
    const params = useParams();
    const userId = params?.id as string;

    const { data: likedPosts, isLoading } = useGetLikedPosts(userId);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="w-full">
            {likedPosts && likedPosts.length > 0 ? (
                <GridPostList posts={likedPosts} showUser={false} />
            ) : (
                <p className="text-light-4 text-center mt-10">No liked posts yet.</p>
            )}
        </div>
    );
};

export default LikedPosts;
