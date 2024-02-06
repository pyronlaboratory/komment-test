"use client";

import { cn } from "@/lib/utils";
import { Home, Plus, Settings } from "lucide-react";
import {usePathname, useRouter} from "next/navigation";


export const Sidebar = () => {
const pathname = usePathname();
const router = useRouter();
const routes = [
    {
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


const onNavigate = (url: string, pro:boolean) => {
    // TODO check if subscrtiption is active in order to load a popup for users who have exceeded monthly free tier
    return router.push(url);
}
return (
    <div className="space-y-4 flex flex-col h-full text-primary bg-secondary" >
        <div className="p-3 flex-1 flex justify-center">
            <div className="space-y-2">
                {routes.map((route)=>(
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
