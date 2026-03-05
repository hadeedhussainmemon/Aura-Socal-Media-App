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
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link href="/" className="flex gap-3 items-center">
          <div className="w-32 h-auto text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400 tracking-tighter">
            Aura
          </div>
        </Link>

        {isLoading || !user?.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <>
            <Link href={`/profile/${(user as any).id || user.email}`} className="flex gap-3 items-center">
              <img
                src={user.image || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                className="h-14 w-14 rounded-full"
              />
              <div className="flex flex-col">
                <p className="body-bold">{user.name}</p>
                <p className="small-regular text-light-3">@{(user as any).username || user.name?.split(' ')[0]}</p>
              </div>
            </Link>
            {/* Notification Bell in Sidebar */}
            <div className="mt-4 flex justify-center">
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
                className={`leftsidebar-link group ${isActive && "bg-primary-500"
                  }`}>
                <Link
                  href={link.route}
                  className="flex gap-4 items-center p-4">
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${isActive && "invert-white"
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
        className="shad-button_ghost"
        onClick={(e) => handleSignOut(e)}>
        <img src="/assets/icons/logout.svg" alt="logout" />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
