'use client';

import { useEffect, useState } from 'react';
import { QueryProvider } from '../../src/lib/react-query/QueryProvider';
import { SessionProvider, useSession } from 'next-auth/react';
import Topbar from '../../src/components/shared/Topbar';
import LeftSidebar from '../../src/components/shared/LeftSidebar';
import Bottombar from '../../src/components/shared/Bottombar';
import { Toaster } from '../../src/components/ui/toaster';
import { useRouter } from 'next/navigation';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex-center w-full h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        {children}
      </section>

      <Bottombar />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <SessionProvider>
      <QueryProvider>
        <AuthenticatedLayout>
          {children}
        </AuthenticatedLayout>
        <Toaster />
      </QueryProvider>
    </SessionProvider>
  );
}
