"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import FileUploader from "../shared/FileUploader";
import Loader from "../shared/Loader";
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

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to create a post.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData to handle file upload
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
        className="flex flex-col gap-9 w-full  max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  style={{ height: '80px', minHeight: '80px' }}
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl || ""}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Art, Expression, Learn"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="shad-input">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {POST_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end pt-6 pb-8 mb-6">
          <Button
            type="button"
            className="shad-button_dark_4"
            disabled={isLoading}
            onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoading}>
            {isLoading && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
