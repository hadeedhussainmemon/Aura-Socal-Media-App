"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";

import { SigninValidation } from "@/lib/validation";

const SigninForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    setSignInError(null);
    setIsPending(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: user.email,
        password: user.password,
      });

      if (res?.error) {
        setSignInError("Sorry, your password was incorrect. Please double-check your password.");
        return;
      }

      form.reset();
      router.push("/");
    } catch (error: unknown) {
      console.error('Login error:', error);
      setSignInError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-[350px] flex flex-col items-center mt-12 sm:mt-0 sm:justify-center sm:min-h-full">
      <div className="w-full glass-morphism rounded-[3px] border border-white/10 shadow-glass px-10 py-12 flex flex-col items-center relative overflow-hidden">

        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="w-full text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tighter aura-text-gradient inline-block mt-4">
            Aura
          </h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignin)}
            className="flex flex-col gap-[6px] w-full"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Phone number, username, or email"
                      className="insta-input"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (signInError) setSignInError(null);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] sm:text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="insta-input"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (signInError) setSignInError(null);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] sm:text-xs" />
                </FormItem>
              )}
            />

            {signInError && (
              <div className="text-red-500 text-sm mt-4 text-center">
                {signInError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors h-10 mt-4 mb-4"
              disabled={isPending}
            >
              {isPending ? <Loader /> : "Log in"}
            </Button>

            <div className="flex items-center w-full my-4">
              <div className="border-t border-white/20 flex-grow"></div>
              <span className="px-4 text-light-3 text-xs font-semibold uppercase">or</span>
              <div className="border-t border-white/20 flex-grow"></div>
            </div>

            <div className="text-center mt-3">
              <Link
                href="/forgot-password"
                className="text-xs text-light-1 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </Form>
      </div>

      <div className="w-full glass-morphism rounded-[3px] border border-white/10 shadow-glass py-5 mt-4 text-center">
        <p className="text-sm text-light-1">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary-500 font-semibold hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SigninForm;
