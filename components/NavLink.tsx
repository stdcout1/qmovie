'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import { navigationMenuSelected, navigationMenuTriggerStyle } from './ui/navigation-menu';
import { cn } from '@/lib/utils';

type NavLinkProps = {
    href: string
    children: string
}

function NavLink(props: NavLinkProps) {
    const path = usePathname();
    return (
        <Link href={props.href} className={cn(navigationMenuTriggerStyle(), navigationMenuSelected(props.href, path))}>{props.children}</Link>
    )
}

export default NavLink
