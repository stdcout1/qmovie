"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signoutUser } from "./server/signoutUser"

interface MobileNavProps {
    user: any | null
}

export function MobileNav({ user }: MobileNavProps) {
    const [open, setOpen] = React.useState(false)
    const pathname = usePathname()

    const routes = [
        {
            href: "/",
            label: "Home",
        },
        {
            href: "/my-saved",
            label: "My Saved",
        },
    ]

    const authRoutes = user
        ? [
            {
                href: "#",
                label: "Sign Out",
                onClick: async () => {
                    await signoutUser()
                    setOpen(false)
                },
            },
        ]
        : [
            {
                href: "/signin",
                label: "Sign In",
            },
            {
                href: "/signup",
                label: "Sign Up",
            },
        ]

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <div className="px-7">
                    <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                        <span className="text-2xl font-bold">qMovie</span>
                    </Link>
                </div>
                <div className="flex flex-col space-y-3 pt-6">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "px-7 py-2 text-base font-medium transition-colors hover:text-primary",
                                pathname === route.href ? "text-foreground" : "text-muted-foreground",
                            )}
                        >
                            {route.label}
                        </Link>
                    ))}
                    <div className="h-px w-full bg-border" />
                    {authRoutes.map((route) =>
                        route.onClick ? (
                            <button
                                key={route.href}
                                onClick={route.onClick}
                                className="px-7 py-2 text-left text-base font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                {route.label}
                            </button>
                        ) : (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className="px-7 py-2 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                {route.label}
                            </Link>
                        ),
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

