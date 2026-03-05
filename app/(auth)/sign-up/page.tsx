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
import { useToast } from "@/components/ui/use-toast";

import { SignupValidation } from "@/lib/validation";

const SignupForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    setSignUpError(null);
    setIsPending(true);

    try {
      // 1. Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignUpError(data.message || "Sign up failed. Please try again.");
        setIsPending(false);
        return;
      }

      // 2. Automatically log them in
      const res = await signIn("credentials", {
        redirect: false,
        email: user.email,
        password: user.password,
      });

      if (res?.error) {
        setSignUpError("Sign up was successful, but auto-login failed. Please try logging in manually.");
        setIsPending(false);
        return;
      }

      form.reset();
      router.push("/");
    } catch (error: any) {
      console.error('Signup error:', error);
      setSignUpError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-md px-6 flex flex-col items-center mt-12 sm:mt-0 sm:pt-2 sm:justify-center sm:min-h-full">
        <div className="w-56 h-auto mb-6 sm:w-64 sm:mb-8 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400 text-center tracking-tighter">
          Aura
        </div>

        <h2 className="text-lg font-bold text-center mb-1 sm:text-xl sm:mb-2">
          Create a new account
        </h2>
        <p className="text-light-3 text-sm text-center mb-4 sm:mb-5">
          To use Aura, Please enter your details.
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-3 w-full sm:gap-4">
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
                  <Input type="text" className="shad-input" {...field} />
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
                  <Input type="text" className="shad-input" {...field} />
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
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {signUpError && (
            <div className="text-red-500 text-sm mt-1 p-2 bg-red-900/20 border border-red-500/50 rounded-md">
              {signUpError}
            </div>
          )}

          <Button type="submit" className="shad-button_primary mt-3 sm:mt-4">
            {isPending ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-sm text-light-2 text-center mt-3 sm:mt-4">
            Already have an account?
            <Link
              href="/sign-in"
              className="text-primary-500 text-sm font-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;