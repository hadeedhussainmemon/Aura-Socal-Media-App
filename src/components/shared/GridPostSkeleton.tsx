import { Skeleton } from "@/components/ui/skeleton";

const GridPostSkeleton = () => {
    return (
        <li className="relative aspect-square overflow-hidden group/griditem border border-black/50">
            <Skeleton className="h-full w-full rounded-none" />
        </li>
    );
};

export default GridPostSkeleton;
