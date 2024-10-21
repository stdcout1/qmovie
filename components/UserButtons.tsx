'use client'
import React from 'react'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    navigationMenuTriggerStyle,
    navigationMenuSelected,
} from "@/components/ui/navigation-menu"
import NavLink from './NavLink'
import { Button } from './ui/button'
import { signoutUser } from './server/signoutUser'

function UserButtons({ ...props }) {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>{props.user.username}</NavigationMenuTrigger>
                    <NavigationMenuContent className='space-y-3'>
                        <NavigationMenuLink onClick={async () => await signoutUser()} className={"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"} >
                            Signout
                        </NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

export default UserButtons
