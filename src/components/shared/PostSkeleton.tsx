import { Skeleton } from "@/components/ui/skeleton";

const PostSkeleton = () => {
    return (
        <div className="bg-black sm:bg-dark-2 sm:border sm:border-white/10 sm:rounded-[8px] w-full max-w-screen-sm mb-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between p-3 sm:p-4 pb-0">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
                    <div className="flex flex-col gap-2 mt-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" /> {/* Options placeholder */}
            </div>

            {/* Image */}
            <Skeleton className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-none" />

            {/* Action Bar */}
            <div className="px-3 sm:px-4 flex justify-between">
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            {/* Caption & Timestamp */}
            <div className="px-3 sm:px-4 pb-4 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4 mt-2" />
            </div>
        </div>
    );
};

export default PostSkeleton;
