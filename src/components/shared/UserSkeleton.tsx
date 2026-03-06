import { Skeleton } from "@/components/ui/skeleton";

const UserSkeleton = () => {
    return (
        <div className="flex-center flex-col gap-3 xs:gap-4 bg-dark-2 border border-white/10 rounded-[20px] px-3 xs:px-5 py-6 xs:py-8 w-full">
            <Skeleton className="rounded-full w-14 h-14" />
            <div className="flex-center flex-col gap-2 w-full">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg mt-2" />
        </div>
    );
};

export default UserSkeleton;
