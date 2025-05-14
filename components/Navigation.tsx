import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"

import { ModeToggle } from "./ModeToggle"
import NavLink from "./NavLink"
import AuthButtons from "./AuthButtons"
import UserButtons from "./UserButtons"
import { validateUser } from "./server/validateUser"
import { SearchBar } from "./search-bar"
import { MobileNav } from "./mobile-nav"

async function Navigation() {
    const { user } = await validateUser()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <MobileNav user={user} />

                <div className="mr-4 hidden md:flex">
                    <span className="text-2xl font-bold mr-4">qMovie</span>

                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavLink href="/">Home</NavLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavLink href="/my-saved">My Saved</NavLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <SearchBar />
                    {user ? <UserButtons user={user} /> : <AuthButtons />}
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}

export default Navigation

