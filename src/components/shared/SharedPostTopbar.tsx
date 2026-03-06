"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "next-auth"; // Import Session type

// Define a custom User type that matches the expected structure
interface CustomUser {
  id: string;
  name?: string | null;
  image?: string | null; // Assuming 'image' is the property used by next-auth, not 'image_url'
  imageUrl?: string | null; // For the fallback in the src attribute
  bio?: string | null;
}

// Extend the Session type to include our CustomUser
interface CustomSession extends Session {
  user: CustomUser & Session['user'];
}

const SharedPostTopbar = () => {
  const { data: session } = useSession();
  // Cast the session to our custom type to get type-safe access to user properties
  const user = (session as CustomSession)?.user;

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link href="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={130}
            height={325}
          />
        </Link>
        <div className="flex gap-4">
          <Link href="/sign-in" className="flex-center gap-3">
            <img
              src={user?.image || (user as { imageUrl?: string })?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SharedPostTopbar;
