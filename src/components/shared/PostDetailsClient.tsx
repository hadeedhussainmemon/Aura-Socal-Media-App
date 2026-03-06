"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { multiFormatDateString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PostStats from "@/components/shared/PostStats";
import GridPostList from "@/components/shared/GridPostList";
import Comments from "@/components/shared/Comments";
import { getUserPostsServer } from "@/lib/actions/post.actions";
import { IPost } from "@/types";

type PostDetailsClientProps = {
    post: IPost;
};

const PostDetailsClient = ({ post }: PostDetailsClientProps) => {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;

    const [relatedPosts, setRelatedPosts] = useState<IPost[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchRelatedPosts = async () => {
            if (post?.creator?._id) {
                try {
                    const userPosts = await getUserPostsServer(post.creator._id);
                    const filteredPosts = userPosts?.filter((p: IPost) => p._id !== post._id) || [];
                    setRelatedPosts(filteredPosts);
                } catch (error) {
                    console.error("Error fetching related posts:", error);
                }
            }
        };

        fetchRelatedPosts();
    }, [post]);

    const handleDeletePost = async () => {
        if (!post?._id) return;

        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                setIsDeleting(true);
                const res = await fetch(`/api/posts/${post._id}`, {
                    method: "DELETE"
                });

                if (!res.ok) throw new Error("Failed to delete post");

                router.push("/");
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="post_details-container flex flex-col items-center">
            <div className="hidden md:flex max-w-5xl w-full mb-4">
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    className="hover:bg-white/10 transition-colors">
                    <Image
                        src={"/assets/icons/back.svg"}
                        alt="back"
                        width={24}
                        height={24}
                    />
                    <p className="small-medium lg:base-medium ml-2">Back</p>
                </Button>
            </div>

            <div className="post_details-card glass-morphism overflow-hidden rounded-[24px] border border-white/10 shadow-glass max-w-5xl w-full flex flex-col md:flex-row">
                {/* Post Image Section */}
                <div className="md:w-3/5 bg-black/50 flex items-center justify-center p-2 min-h-[400px]">
                    <Image
                        src={post?.imageUrl || ""}
                        alt="post"
                        width={800}
                        height={800}
                        className="w-full h-full object-contain max-h-[700px] rounded-[16px]"
                    />
                </div>

                {/* Post Info Section */}
                <div className="md:w-2/5 flex flex-col border-l border-white/10 h-full min-h-[500px]">
                    {/* Header */}
                    <div className="flex-between w-full p-5 border-b border-white/5">
                        <Link
                            href={`/profile/${post?.creator.username || post?.creator._id}`}
                            className="flex items-center gap-3 group">
                            <Image
                                src={post?.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                                alt="creator"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover border border-white/20 group-hover:border-primary-500 transition-all"
                            />
                            <div className="flex flex-col">
                                <p className="base-medium text-light-1 group-hover:text-primary-500 transition-colors">
                                    {post?.creator.name}
                                </p>
                                <div className="flex items-center gap-2 text-light-3 text-[10px] uppercase font-bold tracking-tighter">
                                    <p>{multiFormatDateString(post?.createdAt)}</p>
                                    <span>•</span>
                                    <p className="truncate max-w-[100px]">{post?.location}</p>
                                </div>
                            </div>
                        </Link>

                        <div className="flex-center gap-4">
                            <Link
                                href={`/update-post/${post?._id}`}
                                className={`${user?.id !== post?.creator._id && "hidden"} hover:scale-110 transition-transform`}>
                                <Image src={"/assets/icons/edit.svg"} alt="edit" width={22} height={22} className="opacity-70 invert-white" />
                            </Link>

                            <Button
                                onClick={handleDeletePost}
                                variant="ghost"
                                disabled={isDeleting}
                                className={`p-0 h-auto hover:bg-transparent ${user?.id !== post?.creator._id && "hidden"}`}>
                                <Image src={"/assets/icons/delete.svg"} alt="delete" width={22} height={22} className="opacity-70 hover:opacity-100 transition-opacity" />
                            </Button>
                        </div>
                    </div>

                    {/* Content & Comments */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5">
                        {/* Caption */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                                <Link href={`/profile/${post?.creator.username}`} className="base-bold text-light-1 hover:text-primary-500 transition-colors">
                                    {post?.creator.name}
                                </Link>
                                <p className="small-medium text-light-2 leading-relaxed">{post?.caption}</p>
                            </div>
                            <ul className="flex flex-wrap gap-1">
                                {post?.tags?.map((tag: string, index: number) => (
                                    <li key={`${tag}${index}`} className="text-primary-500 text-xs font-semibold hover:underline cursor-pointer">
                                        #{tag}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <hr className="border-white/5" />

                        {/* Comments Component */}
                        <div className="flex-1">
                            <Comments postId={post._id || post.id} />
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="p-4 border-t border-white/5 bg-white/5 mt-auto">
                        <PostStats post={post} userId={user?.id || ""} showComments={false} />
                    </div>
                </div>
            </div>

            {/* More Posts Section */}
            <div className="w-full max-w-5xl mt-16 px-4">
                <div className="flex items-center gap-3 mb-8">
                    <hr className="flex-1 border-white/10" />
                    <h3 className="base-bold md:h3-bold text-light-3">More from {post?.creator.name}</h3>
                    <hr className="flex-1 border-white/10" />
                </div>

                {relatedPosts.length > 0 ? (
                    <GridPostList posts={relatedPosts} />
                ) : (
                    <div className="w-full text-center py-10 text-light-4">No other posts yet.</div>
                )}
            </div>
        </div>
    );
};

export default PostDetailsClient;
