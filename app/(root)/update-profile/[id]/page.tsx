"use client";

import React, { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PRIVACY_SETTINGS } from "@/constants";

import { ProfileValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import ProfileUploader from "@/components/shared/ProfileUploder";

import { getUserByIdServer } from "@/lib/actions/user.actions";
import { IUser } from "@/types";

const UpdateProfile = () => {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const userId = Array.isArray(id) ? id[0] : id;

  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: "",
      username: "",
      email: "",
      bio: "",
      privacy_setting: "public",
    },
  });

  // Fetch initial profile data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        setIsInitializing(true);
        const data = await getUserByIdServer(userId);
        setCurrentUser(data);

        if (data) {
          form.reset({
            file: [],
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            bio: data.bio || "",
            privacy_setting: data.privacy_setting || "public",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user configuration", error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUser();
  }, [userId, form]);

  if (isInitializing || !currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  // Handler
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    try {
      setIsLoadingUpdate(true);

      const formData = new FormData();
      formData.append('name', value.name);
      formData.append('bio', value.bio || '');
      formData.append('username', value.username);
      formData.append('privacy_setting', value.privacy_setting || 'public');

      if (value.file && value.file.length > 0) {
        formData.append('file', value.file[0]);
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error("Update user failed.");

      const updatedUser = await res.json();

      // Update NextAuth Session internally
      if (user) {
        await updateSession({
          ...session,
          user: {
            ...user,
            name: updatedUser.name,
            username: updatedUser.username
          }
        });
      }

      toast({
        title: "Profile updated successfully!",
      });

      router.push(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: `Update user failed. Please try again.`,
      });
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container md:pt-12">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.imageUrl || currentUser.image_url}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="privacy_setting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Privacy Setting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="shad-input">
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIVACY_SETTINGS.map((setting) => (
                        <SelectItem key={setting.value} value={setting.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{setting.label}</span>
                            <span className="text-sm text-light-3">{setting.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end mobile-bottom-spacing">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isLoadingUpdate}>
                {isLoadingUpdate && <Loader />}
                Update Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
