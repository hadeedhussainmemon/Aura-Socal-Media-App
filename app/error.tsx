"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="z-10 text-center max-w-2xl">
                <div className="mb-8 inline-block animate-bounce">
                    <div className="p-4 rounded-3xl glass-morphism border border-white/10 shadow-glass">
                        <span className="text-6xl">🚀</span>
                    </div>
                </div>

                <h1 className="h1-bold md:h1-bold aura-text-gradient mb-4">
                    Something cool is building...
                </h1>

                <p className="text-light-3 text-lg mb-8 leading-relaxed">
                    We encountered a slight turbulence in the Aura field. Our engineers are
                    enhancing your experience right now. Don&apos;t worry, your data is safe!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={() => reset()}
                        className="shad-button_primary px-8 h-12 rounded-xl text-md font-semibold hover:scale-105 transition-transform"
                    >
                        Try To Refresh Aura
                    </Button>

                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="text-light-2 hover:bg-white/10 px-8 h-12 rounded-xl text-md border border-white/5"
                        >
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500">
                        Aura System Update in Progress
                    </p>
                </div>
            </div>

            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[url('/assets/icons/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
        </div>
    );
}
