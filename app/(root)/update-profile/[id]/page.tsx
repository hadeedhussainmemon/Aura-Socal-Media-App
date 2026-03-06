"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
      <div className="flex-center w-full min-h-screen">
        <Loader />
      </div>
    );

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
        variant: "destructive"
      });
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-screen bg-transparent">
      <div className="common-container py-10 md:py-20">
        <div className="max-w-4xl w-full mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 shadow-glow">
              <Image
                src="/assets/icons/edit.svg"
                width={28}
                height={28}
                alt="edit"
                className="aura-text-gradient"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="h3-bold md:h2-bold text-left aura-text-gradient">Edit Your Aura</h2>
              <p className="text-light-3 text-sm">Customize how the universe sees you</p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="flex flex-col gap-8 w-full glass-morphism p-8 sm:p-12 rounded-[40px] border border-white/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7928CA]/5 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                {/* Left: Avatar Upload */}
                <div className="lg:col-span-4 flex flex-col items-center gap-6">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormControl>
                          <ProfileUploader
                            fieldChange={field.onChange}
                            mediaUrl={currentUser.imageUrl || currentUser.image_url || "/assets/icons/profile-placeholder.svg"}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-[10px] mt-2 font-medium" />
                      </FormItem>
                    )}
                  />
                  <div className="text-center px-4">
                    <p className="text-xs font-bold text-light-1 uppercase tracking-widest mb-2">Profile Picture</p>
                    <p className="text-[10px] text-light-3 leading-relaxed">Best results with square images. Max 2MB.</p>
                  </div>
                </div>

                {/* Right: Form Fields */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your display name" type="text" className="h-12 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm text-light-1 focus-visible:ring-primary-500/30 transition-all hover:bg-white/10" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Username</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="h-12 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm text-light-3 cursor-not-allowed opacity-60"
                              {...field}
                              disabled
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Account Email</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            className="h-12 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm text-light-3 cursor-not-allowed opacity-60"
                            {...field}
                            disabled
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Personal Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell the world about your aura..."
                            className="min-h-[120px] bg-white/5 border border-white/5 rounded-[24px] px-5 py-4 text-sm text-light-1 focus-visible:ring-primary-500/30 transition-all hover:bg-white/10 resize-none custom-scrollbar"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy_setting"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold text-light-3 uppercase tracking-widest pl-1">Account Privacy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm text-light-1 focus:ring-primary-500/30 transition-all hover:bg-white/10">
                              <SelectValue placeholder="Select privacy level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-2 border border-white/10 rounded-2xl backdrop-blur-xl">
                            {PRIVACY_SETTINGS.map((setting) => (
                              <SelectItem key={setting.value} value={setting.value} className="text-light-1 focus:bg-primary-500/20 focus:text-white rounded-xl mx-1 py-3 group">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-sm">{setting.label}</span>
                                  <span className="text-[10px] text-light-3 group-focus:text-light-2">{setting.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center justify-end pt-8 border-t border-white/5 mt-4 relative z-10 transition-all">
                <Button
                  type="button"
                  className="h-12 px-8 rounded-2xl bg-white/5 text-light-3 font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95"
                  onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-10 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-xl shadow-primary-500/25 active:scale-95 transition-all flex gap-3"
                  disabled={isLoadingUpdate}>
                  {isLoadingUpdate && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Secure Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
