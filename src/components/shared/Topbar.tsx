"use client";

import Link from "next/link";

import { Button } from "../ui/button";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "@/components/shared/NotificationBell";

const Topbar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  // Placeholder for Admin check, needs to be updated with NextAuth later
  const isAdmin = false;

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link href="/" className="flex gap-3 items-center">
          <div className="w-16 h-auto text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400 tracking-tighter">
            Aura
          </div>
        </Link>

        <div className="flex gap-2 items-center">
          <NotificationBell />

          {/* Admin Button - only show if user has admin access */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                className="shad-button_ghost p-2"
                title="Admin Dashboard"
              >
                <img
                  src="/assets/icons/filter.svg"
                  alt="admin"
                  width={18}
                  height={18}
                />
              </Button>
            </Link>
          )}

          <Button
            className="shad-button_ghost p-2"
            onClick={() => signOut({ callbackUrl: '/sign-in' })}>
            <img src="/assets/icons/logout.svg" alt="logout" width={18} height={18} />
          </Button>
          <Link href={`/profile/${user?.id}`} className="flex-center">
            <img
              src={user?.image || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-7 w-7 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
