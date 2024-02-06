"use client";

import { cn } from "@/lib/utils";
import { Home, Plus, Settings } from "lucide-react";
import {usePathname, useRouter} from "next/navigation";


/**
 * @description Return Sidebar component based on prop changes
 */
export const Sidebar = () => {
const pathname = usePathname();
const router = useRouter();
const routes = [
    {
{/**
 * @description Sidebar renderes a navigation menu with three items when provided
 * with the "usePathname", "useRouter" hooks and routes array as props. When an item
 * is clicked on it utilizes the onNavigate method which sends the user to the desired
 * page
 * 
 * @param { object } route - The `route` input parameter provides the information of
 * an available navigation path with its corresponding icon and href.
 */}
        icon: Home,
        href:"/",
        label:"Home",
        pro: false
    },
        icon: Plus,
        href:"/sage/new",
        label:"Create",
        pro: false
    },
    {
        icon: Settings,
        href:"/settings",
        label:"Settings",
        pro: false
    }
    
];


/**
 * @description Navigate url with subscription checking when enabled and direct routing
 * otherwise
 * 
 * @param { string } url - URL Parameter: Specifies the link or resource the user is
 * directed to after clicking navigate button; only accepts strings
 * 
 * @param { boolean } pro - The `pro` input parameter determines whether or not to
 * load a popup.
 * 
 * @returns { Promise } Function returns push.
 */
const onNavigate = (url: string, pro:boolean) => {
    // TODO check if subscrtiption is active in order to load a popup for users who have exceeded monthly free tier
    return router.push(url);
}
return (
    <div className="space-y-4 flex flex-col h-full text-primary bg-secondary" >
        <div className="p-3 flex-1 flex justify-center">
            <div className="space-y-2">
                {routes.map((route)=>(
{/**
 * @description Navigates to a new URL specified by the < Route />.
 */}
                    <div key={route.href} onClick={()=> onNavigate(route.href, route.pro)} className={cn("text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition", pathname === route.href && "bg-primary/10 text-primary")}>
                        <div className="flex flex-col gap-y-2 items-center flex-1">
                            <route.icon className="h-5 w-5"></route.icon>
                            {route.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
         </div>
)
}
