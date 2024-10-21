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

import { ModeToggle } from './ModeToggle';
import NavLink from './NavLink';
import AuthButtons from './AuthButtons';
import UserButtons from './UserButtons';
import { validateUser } from './server/validateUser';




async function Navigation() {
    async function Authed() {
        'use server'
        const {user} = await validateUser();
        if (!user) {
            return <AuthButtons />
        }
        return <UserButtons user={user} />
    }
    return (
        <div className='flex grow justify-between flex-wrap items-center backdrop-blur-sm bg-foreground/10 sticky top-0 z-10'>
            <div className='flex grow justify-start flex-wrap items-center'>
                <h1 className='text-2xl font-bold m-3'>qMovie</h1>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavLink href='/'>
                                Home
                            </NavLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavLink href='/my-saved'>
                                My Saved
                            </NavLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <Authed />
            <ModeToggle />

        </div>
    )
}

export default Navigation
