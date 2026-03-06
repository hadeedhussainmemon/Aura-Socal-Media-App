import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // If user is already logged in, redirect them to home page immediately
    if (session?.user) {
        redirect("/");
    }

    return (
        <div className="w-full h-full flex overflow-hidden auth-layout">
            <section className="flex flex-1 justify-start items-start pt-4 sm:justify-center sm:items-center flex-col px-4 min-h-0 bg-dark-1">
                {children}
            </section>
            <Image
                src="/assets/images/aura-side-img.png"
                alt="branding"
                width={700}
                height={1000}
                className="hidden xl:block h-full w-1/2 object-cover bg-no-repeat flex-shrink-0"
            />
        </div>
    );
}
