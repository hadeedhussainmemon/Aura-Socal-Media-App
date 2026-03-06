import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full h-full flex overflow-hidden auth-layout">
            <section className="flex flex-1 justify-start items-start pt-4 sm:justify-center sm:items-center flex-col px-4 min-h-0 bg-dark-1">
                {children}
            </section>
            <Image
                src="/assets/images/side-img.svg"
                alt="logo"
                width={700}
                height={1000}
                className="hidden xl:block h-full w-1/2 object-cover bg-no-repeat flex-shrink-0"
            />
        </div>
    );
}
