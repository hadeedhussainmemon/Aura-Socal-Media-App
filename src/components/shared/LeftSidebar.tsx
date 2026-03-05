"use client";

import Link from "next/link";
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
  let hasAdminAccess: boolean = false;

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
    <nav className="leftsidebar glassmorphism shadow-glass">
      <div className="flex flex-col gap-11">
        <Link href="/" className="flex gap-3 items-center group">
          <div className="w-32 h-auto text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400 tracking-tighter group-hover:scale-105 transition-transform duration-300">
            Aura
          </div>
        </Link>

        {isLoading || !user?.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <>
            <Link href={`/profile/${(user as any).id || (user as any)._id || user.email}`} className="flex gap-3 items-center group">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={user.image || "/assets/icons/profile-placeholder.svg"}
                  alt="profile"
                  className="h-14 w-14 rounded-full object-cover border-2 border-dark-2"
                />
              </div>
              <div className="flex flex-col">
                <p className="body-bold group-hover:text-primary-500 transition-colors">{user.name}</p>
                <p className="small-regular text-light-3">@{(user as any).username || user.name?.split(' ')[0]}</p>
              </div>
            </Link>
            {/* Notification Bell in Sidebar */}
            <div className="mt-4 flex justify-center backdrop-blur-md bg-white/5 rounded-full p-2">
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
                className={`leftsidebar-link group ${isActive && "bg-primary-500 shadow-glow"
                  }`}>
                <Link
                  href={link.route}
                  className="flex gap-4 items-center p-4">
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:scale-110 transition-transform ${isActive && "invert-white"
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
        <img src="/assets/icons/logout.svg" alt="logout" className="group-hover:scale-110 transition-transform" />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
