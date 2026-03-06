"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import FileUploader from "../shared/FileUploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";
import { POST_CATEGORIES } from "@/constants";

import { IPost } from "@/types";

type PostFormProps = {
  post?: IPost;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? (Array.isArray(post.tags) ? post.tags.join(",") : post.tags || "") : "",
      category: post ? post.category : "general",
    },
  });

  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    if (!user?.id) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("caption", value.caption);
      formData.append("location", value.location);
      formData.append("tags", value.tags);
      formData.append("category", value.category);
      formData.append("userId", user.id);

      if (value.file && value.file.length > 0) {
        formData.append("file", value.file[0]);
      }

      if (action === "Update" && post?._id) {
        formData.append("postId", post._id.toString());
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "PUT",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to update post");

        toast({ title: "Post updated successfully!" });
        router.push(`/posts/${post._id}`);
      } else {
        const res = await fetch("/api/posts", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to create post");

        toast({ title: "Post created successfully!" });
        router.push("/");
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing post:`, error);
      toast({
        title: `${action} post failed. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl glass-morphism p-6 sm:p-10 rounded-[32px] border border-white/5 shadow-glass overflow-hidden relative">

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7928CA]/5 blur-[120px] rounded-full -ml-48 -mb-48" />

        {/* Left Side: File Uploader (Visual Heavyweight) */}
        <div className="flex-1 w-full lg:max-w-[55%] relative z-10">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem className="h-full">
                <FormControl>
                  <FileUploader
                    fieldChange={field.onChange}
                    mediaUrl={post?.imageUrl || ""}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-[10px] mt-2 font-medium bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10 w-fit" />
              </FormItem>
            )}
          />
        </div>

        {/* Right Side: Form Details */}
        <div className="flex-1 flex flex-col gap-6 relative z-10">
          {/* User Info Header */}
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-10 h-10 rounded-full border border-primary-500/20 p-0.5">
              <Image
                src={user?.image || "/assets/icons/profile-placeholder.svg"}
                alt="avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-light-1">@{user?.name || "current_user"}</p>
              <p className="text-[10px] text-light-3 uppercase tracking-wider font-semibold">Editing Draft</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write a caption that captures the moment..."
                    className="bg-transparent border-none text-light-1 text-base placeholder:text-light-4 focus-visible:ring-0 resize-none min-h-[120px] custom-scrollbar p-1"
                    {...field}
                  />
                </FormControl>
                <div className="h-px bg-white/5 w-full mt-2" />
                <FormMessage className="text-red-500 text-[10px] mt-1 font-medium px-1" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-5">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Location</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        placeholder="Add a location to your memory..."
                        className="h-11 bg-white/5 border border-white/5 rounded-2xl px-11 text-sm text-light-1 placeholder:text-light-4 focus-visible:ring-primary-500/30 transition-all group-hover:bg-white/10"
                        {...field}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 text-lg group-hover:scale-110 transition-transform">📍</span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-[10px] font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Aura Tags</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        placeholder="Art, Vibe, Moments (separate with commas)"
                        className="h-11 bg-white/5 border border-white/5 rounded-2xl px-11 text-sm text-light-1 placeholder:text-light-4 focus-visible:ring-primary-500/30 transition-all group-hover:bg-white/10"
                        {...field}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 text-lg group-hover:scale-110 transition-transform">🏷️</span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-[10px] font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <div className="relative group">
                        <SelectTrigger className="h-11 bg-white/5 border border-white/5 rounded-2xl px-11 text-sm text-light-1 focus:ring-primary-500/30 transition-all group-hover:bg-white/10">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 text-lg group-hover:scale-110 transition-transform pointer-events-none">✨</span>
                      </div>
                    </FormControl>
                    <SelectContent className="bg-dark-2 border border-white/10 rounded-2xl backdrop-blur-xl">
                      {POST_CATEGORIES.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                          className="text-light-1 focus:bg-primary-500/20 focus:text-white rounded-xl mx-1"
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-[10px] font-medium" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4 items-center justify-end mt-auto pt-6 px-1">
            <Button
              type="button"
              className="h-11 px-6 rounded-2xl bg-white/5 text-light-3 hover:bg-white/10 hover:text-white transition-all font-bold text-sm"
              disabled={isLoading}
              onClick={() => router.back()}>
              Dispose
            </Button>
            <Button
              type="submit"
              className="h-11 px-10 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-xl shadow-primary-500/25 active:scale-95 transition-all flex gap-3"
              disabled={isLoading}>
              {isLoading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {action === "Create" ? "Publish Post" : "Update Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
