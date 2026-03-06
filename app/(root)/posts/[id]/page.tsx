import { Metadata } from "next";
import { getPostByIdServer } from "@/lib/actions/post.actions";
import PostDetailsClient from "@/components/shared/PostDetailsClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: postId } = await params;
  const post = await getPostByIdServer(postId);

  if (!post) {
    return {
      title: "Post Not Found | Aura",
    };
  }

  return {
    title: `${post.caption?.substring(0, 50) || "Post"} | Aura`,
    description: post.caption || "View this post on Aura",
    openGraph: {
      title: `${post.creator?.name}'s Post on Aura`,
      description: post.caption || "View this post on Aura",
      images: [
        {
          url: post.imageUrl || "/assets/images/aura-og.png",
          width: 1200,
          height: 630,
          alt: post.caption || "Aura Post",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.creator?.name}'s Post on Aura`,
      description: post.caption || "View this post on Aura",
      images: [post.imageUrl || "/assets/images/aura-og.png"],
    },
  };
}

const PostDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: postId } = await params;
  const post = await getPostByIdServer(postId);

  if (!post) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center">
      <PostDetailsClient post={post} />
    </div>
  );
};

export default PostDetails;
