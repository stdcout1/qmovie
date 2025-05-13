import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SavedItemsProvider } from "./saved-item-context";

const inter = localFont({ src: './Inter.ttf' });

export const metadata: Metadata = {
    title: "qmovie",
    description: "movie streaming",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Navigation />
                    <SavedItemsProvider>
                        {children}
                    </SavedItemsProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html >
    );
}
