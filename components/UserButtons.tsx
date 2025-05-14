"use client"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "./ui/button"
import { signoutUser } from "./server/signoutUser"

function UserButtons({ user }) {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ""} alt={user.username} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="w-[200px] p-2">
                            <Button variant="ghost" className="w-full justify-start" onClick={async () => await signoutUser()}>
                                Sign Out
                            </Button>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

export default UserButtons

