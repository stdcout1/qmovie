import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu"
import NavLink from "./NavLink"
import { Button } from "./ui/button"

function AuthButtons() {
    return (
        <div className="flex items-center">
            <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Button variant="ghost" asChild className="mr-1">
                            <NavLink href="/signup">Sign Up</NavLink>
                        </Button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Button variant="default" asChild>
                            <NavLink href="/signin">Sign In</NavLink>
                        </Button>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}

export default AuthButtons

