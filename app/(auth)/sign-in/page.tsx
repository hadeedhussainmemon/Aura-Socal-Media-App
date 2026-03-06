"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
        setSignInError("Invalid credentials. Please check your email and password.");
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
    <Form {...form}>
      <div className="w-full max-w-md px-6 flex flex-col items-center mt-20 sm:mt-0 sm:pt-2 sm:justify-center sm:min-h-full">
        <div className="w-56 h-auto mb-6 sm:w-64 sm:mb-8 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400 text-center tracking-tighter">
          Aura
        </div>

        <h2 className="text-lg font-bold text-center mb-1 sm:text-xl sm:mb-2">
          Log in to your account
        </h2>
        <p className="text-light-3 text-sm text-center mb-4 sm:mb-5">
          Welcome back! Please enter your details.
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-3 w-full sm:gap-4">
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
                    onChange={(e) => {
                      field.onChange(e);
                      if (signInError) setSignInError(null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="shad-input"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (signInError) setSignInError(null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-primary-500 text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {signInError && (
            <div className="text-red-500 text-sm mt-1 p-2 bg-red-900/20 border border-red-500/50 rounded-md">
              {signInError}
            </div>
          )}

          <Button type="submit" className="shad-button_primary mt-3 sm:mt-4">
            {isPending ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <p className="text-sm text-light-2 text-center mt-3 sm:mt-4">
            Don&apos;t have an account?
            <Link
              href="/sign-up"
              className="text-primary-500 text-sm font-semibold ml-1">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;
