"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const SharedPostTopbar = () => {
  const { data: session } = useSession();
  const user = session?.user;

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
              src={user?.image || (user as any)?.imageUrl || "/assets/icons/profile-placeholder.svg"}
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
