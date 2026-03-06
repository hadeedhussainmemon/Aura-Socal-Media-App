"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { bottombarLinks } from "@/constants";

const Bottombar = () => {
  const pathname = usePathname();

  // We'll split the links and put a special "Add Post" button in the middle
  const leftLinks = bottombarLinks.slice(0, 2);
  const rightLinks = bottombarLinks.slice(3, 5);

  return (
    <section className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 md:hidden">
      <div className="flex items-center justify-between glass-morphism border border-white/5 shadow-2xl rounded-[30px] px-6 py-2 relative h-[72px]">
        {/* Left Side Links */}
        <div className="flex items-center justify-around flex-1 mr-8">
          {leftLinks.map((link) => {
            const isActive = pathname === link.route;
            return (
              <Link
                key={`bottombar-${link.label}`}
                href={link.route}
                className={`flex-center flex-col gap-1 transition-all duration-300 relative ${isActive ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  width={22}
                  height={22}
                  className={`${isActive ? "aura-icon-glow" : ""}`}
                />
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_5px_#877EFF]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Center Floating Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link
            href="/create-post"
            className="flex-center w-[74px] h-[74px] rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 p-1 shadow-[0_8px_20px_rgba(135,126,255,0.4)] hover:scale-110 transition-transform duration-300 relative group"
          >
            <div className="w-full h-full rounded-full bg-[#FFD700] flex-center shadow-inner overflow-hidden relative">
              <Image
                src="/assets/icons/gallery-add.svg"
                alt="add post"
                width={28}
                height={28}
                className="invert brightness-0"
              />
              {/* Visual pulse effect */}
              <div className="absolute inset-0 bg-white/20 animate-ping rounded-full scale-75 opacity-20 pointer-events-none" />
            </div>
          </Link>
        </div>

        {/* Right Side Links */}
        <div className="flex items-center justify-around flex-1 ml-8">
          {rightLinks.map((link) => {
            const isActive = pathname === link.route;
            return (
              <Link
                key={`bottombar-${link.label}`}
                href={link.route}
                className={`flex-center flex-col gap-1 transition-all duration-300 relative ${isActive ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  width={22}
                  height={22}
                  className={`${isActive ? "aura-icon-glow" : ""}`}
                />
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_5px_#877EFF]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Bottombar;
