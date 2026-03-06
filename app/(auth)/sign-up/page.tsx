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
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, setIsPending] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Store user data between steps
  const [userData, setUserData] = useState<InitialStepValues | null>(null);
  const [otpValue, setOtpValue] = useState("");

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
    } catch (error) {
      console.error("OTP send error:", error);
      setSignUpError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

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

  return (
    <div className="w-full max-w-[350px] flex flex-col items-center mt-12 sm:mt-0 sm:justify-center sm:min-h-full">
      <div className="w-full glass-morphism rounded-[3px] border border-white/10 shadow-glass px-10 py-12 flex flex-col items-center relative overflow-hidden">

        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="w-full text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter aura-text-gradient inline-block">
            Aura
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
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
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full border-2 border-primary-500/50 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                  <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h2 className="text-base font-semibold text-center mb-2">
                Enter Confirmation Code
              </h2>
              <p className="text-light-3 text-sm text-center mb-6 px-4">
                Enter the 6-digit code we sent to <span className="text-light-1 font-medium">{userData?.email}</span>.
              </p>

              <div className="w-full">
                <Input
                  type="text"
                  placeholder="Confirmation Code"
                  className="insta-input text-center text-lg tracking-widest font-semibold h-12"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
                    setOtpValue(val);
                    setSignUpError(null);
                  }}
                />

                {signUpError && (
                  <div className="text-red-500 text-sm mt-3 text-center">
                    {signUpError}
                  </div>
                )}

                <Button
                  onClick={handleVerifyOtpAndRegister}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors h-10 mt-4"
                  disabled={isPending || otpValue.length !== 6}
                >
                  {isPending ? <Loader /> : "Next"}
                </Button>

                <div className="w-full text-center mt-4">
                  <button
                    onClick={() => {
                      setStep(1);
                      setOtpValue("");
                      setSignUpError(null);
                    }}
                    className="text-primary-500 text-sm font-semibold hover:text-white transition-colors"
                  >
                    Go Back
                  </button>
                  <span className="mx-2 text-light-3">or</span>
                  <button
                    onClick={() => userData && handleSendOtp(userData)}
                    disabled={isPending}
                    className="text-primary-500 text-sm font-semibold hover:text-white transition-colors disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full glass-morphism rounded-[3px] border border-white/10 shadow-glass py-5 mt-4 text-center">
        <p className="text-sm text-light-1">
          Have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary-500 font-semibold hover:text-white transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
