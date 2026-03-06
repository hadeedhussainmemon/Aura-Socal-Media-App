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

  const isMessagesPage = pathname.startsWith('/messages');

  return (
    <nav className={`leftsidebar glass-morphism shadow-glass ${isMessagesPage ? 'leftsidebar-minimized' : ''}`}>
      <div className="flex flex-col gap-10 h-full">
        <Link href="/" className={`px-3 mb-2 flex items-center group ${isMessagesPage ? 'justify-center' : ''}`}>
          <div className={`${isMessagesPage ? 'text-xl' : 'text-2xl'} font-black aura-text-gradient tracking-tighter group-hover:scale-105 transition-transform duration-300`}>
            {isMessagesPage ? 'A' : 'Aura'}
          </div>
        </Link>

        <div className="flex flex-col flex-1 justify-between">
          <ul className="flex flex-col gap-2">
            {filteredSidebarLinks.map((link: INavLink) => {
              const isActive = pathname === link.route;

              return (
                <li
                  key={link.label}
                  className={`leftsidebar-link group transition-all duration-300 ${isActive && "bg-white/5 text-primary-500"
                    }`}>
                  <Link
                    href={link.route}
                    className={`flex gap-4 items-center p-3 ${isMessagesPage ? 'justify-center' : ''}`}>
                    <Image
                      src={link.imgURL}
                      alt={link.label}
                      width={24}
                      height={24}
                      className={`group-hover:scale-110 transition-transform duration-300 ${isActive ? "aura-gradient rounded-sm p-1 invert-white" : "opacity-70 group-hover:opacity-100"
                        }`}
                    />
                    {!isMessagesPage && (
                      <p className={`base-medium ${isActive ? "font-bold text-white" : "font-medium text-light-3"}`}>{link.label}</p>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Notifications Integrated into regular list */}
            <li className={`leftsidebar-link group transition-all duration-300 ${pathname === '/notifications' && "bg-white/5 text-primary-500"}`}>
              <div className={`flex items-center w-full ${isMessagesPage ? 'justify-center' : ''}`}>
                <NotificationBell inlineLabel={isMessagesPage ? undefined : "Notifications"} />
              </div>
            </li>
          </ul>

          <div className="flex flex-col gap-4">
            {isLoading || !user?.email ? (
              <div className="h-10 px-3 flex justify-center">
                <Loader />
              </div>
            ) : (
              <Link
                href={`/profile/${(user as { username?: string }).username || (user as { _id?: string })._id}`}
                className={`flex gap-3 items-center p-3 rounded-xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/5 ${isMessagesPage ? 'justify-center' : ''} ${pathname.includes(`/profile/${(user as { username?: string }).username}`) ? "bg-white/5 border-white/5" : ""
                  }`}
              >
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#7928CA] to-[#FF0080] shrink-0">
                  <Image
                    src={user.image || "/assets/icons/profile-placeholder.svg"}
                    alt="profile"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover border border-dark-1"
                  />
                </div>
                {!isMessagesPage && (
                  <div className="flex flex-col overflow-hidden">
                    <p className="small-semibold uppercase tracking-wider truncate max-w-[120px]">{user.name}</p>
                    <p className="tiny-medium text-light-3 truncate max-w-[120px]">@{(user as { username?: string }).username || "aura_user"}</p>
                  </div>
                )}
              </Link>
            )}

            <Button
              className="shad-button_ghost hover:bg-red-500/10 transition-all duration-300 p-3 rounded-xl group"
              onClick={(e) => handleSignOut(e)}>
              <Image
                src="/assets/icons/logout.svg"
                alt="logout"
                width={22}
                height={22}
                className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
              />
              <p className="small-medium text-light-3 group-hover:text-white">Logout</p>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LeftSidebar;
