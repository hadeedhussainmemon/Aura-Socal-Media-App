"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";

const MobileHeader = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const [greeting, setGreeting] = useState("Good Day");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 md:hidden glass-morphism border-b border-white/5 px-4 py-3">
            <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/profile/${(user as { username?: string })?.username || (user as { _id?: string })?._id || ''}`}
                        className="relative group"
                    >
                        <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 shadow-[0_0_10px_rgba(135,126,255,0.3)]">
                            <Image
                                src={user?.image || "/assets/icons/profile-placeholder.svg"}
                                alt="avatar"
                                width={40}
                                height={40}
                                className="rounded-full h-10 w-10 border-2 border-dark-1 object-cover"
                            />
                        </div>
                    </Link>

                    <div className="flex flex-col">
                        <span className="text-[10px] text-light-3/70 font-medium uppercase tracking-widest">
                            {greeting}
                        </span>
                        <span className="text-sm font-bold text-light-1 tracking-tight">
                            {user?.name || "Member"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <Image
                            src="/assets/icons/search.svg"
                            alt="search"
                            width={18}
                            height={18}
                        />
                    </button>
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <NotificationBell />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
