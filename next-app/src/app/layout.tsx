import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { ProfileProvider } from "@/context/profile-context";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    themeColor: "#10b981",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zooming on inputs in mobile
};

export const metadata: Metadata = {
    title: "Kalkulator Gorączki",
    description: "Kalkulator dawek leków przeciwgorączkowych dla dzieci",
    manifest: "/manifest.json",
    icons: {
        icon: "/icons/icon-192x192.png",
        apple: "/icons/icon-192x192.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Kalkulator Gorączki",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen pb-16`}
            >
                <ProfileProvider>
                    <div className="mx-auto h-full flex flex-col relative bg-slate-950/20 max-w-md w-full shadow-2xl overflow-hidden rounded-xl border-x border-slate-800/50">
                        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
                            {children}
                        </div>
                        <BottomNav />
                        <Toaster position="top-center" />
                        {/* Background glows for layout */}
                        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_50%)]" />
                    </div>
                </ProfileProvider>
            </body>
        </html>
    );
}
