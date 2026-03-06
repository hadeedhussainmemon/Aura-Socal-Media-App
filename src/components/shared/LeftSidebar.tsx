"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";

import { Button } from "@/components/ui/button";
import Loader from "./Loader";
import NotificationBell from "./NotificationBell";

const LeftSidebar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === "loading";

  // Future Admin Check placeholder
  const hasAdminAccess: boolean = false;

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    await signOut({ callbackUrl: '/sign-in' });
  };

  // Filter sidebar links based on admin access
  const filteredSidebarLinks = sidebarLinks.filter((link) => {
    // Show admin link only if user has admin access
    if (link.route === "/admin") {
      return !!hasAdminAccess;
    }
    // Show all other links
    return true;
  });

  return (
    <nav className="leftsidebar glass-morphism shadow-glass">
      <div className="flex flex-col gap-11">
        <Link href="/" className="flex gap-3 items-center group">
          <div className="w-32 h-auto text-4xl font-bold aura-text-gradient tracking-tighter group-hover:scale-105 transition-transform duration-300">
            Aura
          </div>
        </Link>

        {isLoading || !user?.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <>
            <Link
              href={`/profile/${(user as { username?: string }).username || user.id || (user as { _id?: string })._id}`}
              className="flex gap-3 items-center group"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#7928CA] to-[#FF0080] group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={user.image || "/assets/icons/profile-placeholder.svg"}
                  alt="profile"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover border-2 border-dark-1"
                />
              </div>
              <div className="flex flex-col">
                <p className="body-bold group-hover:text-primary-500 transition-colors uppercase tracking-wider">{user.name}</p>
                <p className="small-regular text-light-3">@{(user as { username?: string }).username || "aura_user"}</p>
              </div>
            </Link>
            {/* Notification Bell in Sidebar */}
            <div className="mt-4 flex justify-center backdrop-blur-md bg-white/5 rounded-2xl p-2 border border-white/10">
              <NotificationBell />
            </div>
          </>
        )}

        <ul className="flex flex-col gap-6">
          {filteredSidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-300 rounded-2xl ${isActive && "bg-gradient-to-r from-primary-500 to-purple-500 shadow-glow hover:bg-white/5"
                  }`}>
                <Link
                  href={link.route}
                  className="flex gap-4 items-center p-4">
                  <Image
                    src={link.imgURL}
                    alt={link.label}
                    width={24}
                    height={24}
                    className={`group-hover:scale-110 transition-transform duration-300 ${isActive && "invert-white drop-shadow-md"
                      }`}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        className="shad-button_ghost hover:bg-red-500/10 transition-colors"
        onClick={(e) => handleSignOut(e)}>
        <Image src="/assets/icons/logout.svg" alt="logout" width={24} height={24} className="group-hover:scale-110 transition-transform" />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
