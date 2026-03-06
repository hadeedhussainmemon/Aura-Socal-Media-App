"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";

// Define the validation schema including OTP
const INITIAL_STEP_SCHEMA = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type InitialStepValues = z.infer<typeof INITIAL_STEP_SCHEMA>;

const SignupForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const form = useForm<InitialStepValues>({
    resolver: zodResolver(INITIAL_STEP_SCHEMA),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSendOtp = async (data: InitialStepValues) => {
    setSignUpError(null);
    setIsPending(true);

    try {
      // TEMPORARILY DISABLED OTP SENDING
      /*
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSignUpError(result.message || "Failed to send verification code.");
        setIsPending(false);
        return;
      }

      setUserData(data);
      setStep(2);
      setIsPending(false);
      */

      // INSTANT REGISTRATION INSTEAD (Bypassing OTP)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSignUpError(result.message || "Registration failed.");
        setIsPending(false);
        return;
      }

      // Automatically log them in
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setSignUpError("Registered! But auto-login failed. Please log in manually.");
        setIsPending(false);
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setSignUpError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  /* OTP verification handler — re-enable when domain is purchased
  const handleVerifyOtpAndRegister = async () => {
    if (!userData || otpValue.length !== 6) {
      setSignUpError("Please enter a valid 6-digit code.");
      return;
    }

    setSignUpError(null);
    setIsPending(true);

    try {
      // 1. Register the user with OTP
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          otp: otpValue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignUpError(data.message || "Verification failed. Please check the code and try again.");
        setIsPending(false);
        return;
      }

      // 2. Automatically log them in
      const res = await signIn("credentials", {
        redirect: false,
        email: userData.email,
        password: userData.password,
      });

      if (res?.error) {
        setSignUpError("Verified! But auto-login failed. Please log in manually.");
        setIsPending(false);
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setSignUpError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };
  */

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center mt-12 sm:mt-0 sm:justify-center sm:min-h-full p-4">
      {/* Decorative Aura Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full glass-morphism rounded-[24px] border border-white/10 shadow-glass px-8 py-10 flex flex-col items-center relative overflow-hidden">
        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="w-full text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter aura-text-gradient inline-block">
            Aura
          </h1>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <p className="text-light-3 text-base text-center font-semibold mb-6 px-4 leading-tight">
              Sign up to see photos and videos from your friends.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSendOtp)}
                className="flex flex-col gap-[6px] w-full"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="text" placeholder="Email address" className="insta-input" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="text" placeholder="Full Name" className="insta-input" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="text" placeholder="Username" className="insta-input" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="password" placeholder="Password" className="insta-input" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="password" placeholder="Confirm Password" className="insta-input" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] sm:text-xs" />
                    </FormItem>
                  )}
                />

                {signUpError && (
                  <div className="text-red-500 text-sm mt-2 text-center">
                    {signUpError}
                  </div>
                )}

                <div className="text-center text-xs text-light-3 mt-4 mb-4 px-2">
                  People who use our service may have uploaded your contact information to Aura.
                </div>

                <div className="text-center text-xs text-light-3 mb-4 px-4">
                  By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors h-10 mt-2"
                  disabled={isPending}
                >
                  {isPending ? <Loader /> : "Sign Up"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </AnimatePresence>
      </div >

      <div className="w-full glass-morphism rounded-[24px] border border-white/10 shadow-glass py-5 mt-4 text-center">
        <p className="text-sm text-light-1">
          Have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary-500 font-bold hover:text-white transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div >
  );
};

export default SignupForm;
