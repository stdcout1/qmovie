import React from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from './ui/navigation-menu';
import NavLink from './NavLink';


function AuthButtons() {
    return (
        <NavigationMenu className='hidden md:flex mr-3'>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavLink href='/signup'>
                        Sign Up
                    </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavLink href='/signin'>
                        Sign In
                    </NavLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

export default AuthButtons
