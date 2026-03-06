import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Topbar from "@/components/shared/Topbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Bottombar from "@/components/shared/Bottombar";

import { SocketProvider } from "@/components/shared/SocketProvider";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect('/sign-in');
    }

    return (
        <SocketProvider>
            <div className="w-full md:flex text-white">
                <Topbar />
                <LeftSidebar />

                <section className="flex flex-1 h-full">
                    {children}
                </section>

                <Bottombar />
            </div>
        </SocketProvider>
    );
}
