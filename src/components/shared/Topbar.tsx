"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "../ui/button";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "@/components/shared/NotificationBell";

const Topbar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  // Placeholder for Admin check, needs to be updated with NextAuth later
  const isAdmin = false;

  return (
    <section className="topbar glass-morphism shadow-glass">
      <div className="flex-between py-4 px-5">
        <Link href="/" className="flex gap-3 items-center group">
          <div className="w-16 h-auto text-3xl font-bold aura-text-gradient tracking-tighter group-hover:scale-105 transition-transform duration-300">
            Aura
          </div>
        </Link>

        <div className="flex gap-2 items-center">
          <NotificationBell />

          {/* Admin Button - only show if user has admin access */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                className="shad-button_ghost p-2 hover:bg-primary-500/10 transition-colors"
                title="Admin Dashboard"
              >
                <Image
                  src="/assets/icons/filter.svg"
                  alt="admin"
                  width={18}
                  height={18}
                  className="hover:scale-110 transition-transform"
                />
              </Button>
            </Link>
          )}

          <Button
            className="shad-button_ghost p-2 hover:bg-red-500/20 active:scale-95 transition-all duration-300"
            onClick={() => signOut({ callbackUrl: '/sign-in' })}>
            <Image src="/assets/icons/logout.svg" alt="logout" width={18} height={18} className="hover:scale-110 transition-transform duration-300" />
          </Button>
          <Link
            href={`/profile/${(user as { username?: string })?.username || (user as { _id?: string })?._id || ''}`}
            className="flex-center group"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#7928CA] to-[#FF0080] group-hover:scale-105 transition-transform duration-300">
              <Image
                src={user?.image || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full border-2 border-dark-1 object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
