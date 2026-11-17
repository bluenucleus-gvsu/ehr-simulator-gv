'use client'

import { Home, UserIcon, BookOpenText, Hospital, Presentation, LogOut, ScanBarcode } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroupContent,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { User } from "@supabase/supabase-js";

const adminRoutes = [
  {
    title: "Admin Dashbord",
    url: routes.admin.getHref(),
    icon: Home,
  },
  {
    title: "Courses",
    url: routes.admin.courses.getHref(),
    icon: BookOpenText,
  },
  {
    title: "Cases",
    url: routes.admin.cases.getHref(),
    icon: Hospital,
  },
  {
    title: "Barcode Printing",
    url: routes.admin.barcodes.getHref(),
    icon: ScanBarcode,
  },
]

const getDefaultRoutes = (user: User | null) => {
  if (!user) return [];

  return [
    {
      title: "Profile",
      url: routes.user.getHref(user.id),
      icon: UserIcon,
    },
    {
      title: "Faculty Page",
      url: routes.faculty.getHref(user.id),
      icon: Presentation,
    },
  ];
}

export function AppSidebar() {

  const { loading, user } = useUser();
  const pathname = usePathname();
  const isCurrentPath = (url: string) => pathname === url;

  const defaultRoutes = getDefaultRoutes(user);

  if (loading) return null;

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {adminRoutes.map((route) => (
              <SidebarMenuItem key={route.url}>
                <SidebarMenuButton
                  asChild
                  className={`${isCurrentPath(route.url) && "bg-secondary"}`}>
                  <Link href={route.url}>
                    <route.icon />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroup />

        <SidebarGroup />
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {defaultRoutes.map((route) => (
              <SidebarMenuItem key={route.url}>
                <SidebarMenuButton asChild>
                  <Link href={route.url}>
                    <route.icon />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroup />

      </SidebarContent>
      <SidebarFooter>
        <div className="w-full">
          <Button variant="ghost" size="default" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
