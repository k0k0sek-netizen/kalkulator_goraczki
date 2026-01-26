import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";

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
                <div className="max-w-md mx-auto min-h-screen relative">
                    {children}
                    <BottomNav />
                    <Toaster position="top-center" />
                </div>
            </body>
        </html>
    );
}
