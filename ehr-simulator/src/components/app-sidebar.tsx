'use client'

import { Home, Settings, User, BookOpenText, Hospital, Presentation, LogOut, ScanBarcode } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createBrowserSupabase } from "@/utils/supabase/client";

const adminRoutes = [
  {
    title: "Admin Dashbord",
    url: "/admin",
    icom: Home,
  },
  {
    title: "Courses",
    url: "/admin/courses",
    icom: BookOpenText,
  },
  {
    title: "Cases",
    url: "/admin/cases",
    icom: Hospital,
  },
  {
    title: "Barcode Printing",
    url: "/admin/barcodes",
    icom: ScanBarcode,
  },
  {
    title: "Active Simulations (WIP)",
    url: "/",
    icom: Presentation,
  },
]

export function AppSidebar() {

  const { loading, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isCurrentPath = (url: string) => pathname === url;

  const defaultRoutes = [
    {
      title: "Profile",
      url: user?.id ? `/user/${user.id}` : "/user",
      icom: User,
    },
    {
      title: "Faculty Page",
      url: user?.id ? `/faculty/${user.id}` : "/faculty",
      icom: Presentation,
    },
    {
      title: "Settings",
      url: "/",
      icom: Settings,
    },
  ];

  if (loading) return null;

  const handleLogout = async () => {
    const supabase = createBrowserSupabase();

    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('role');
    }
    router.push('/auth/login');
  }

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
                    <route.icom />
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
                    <route.icom />
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
          <Button variant="ghost" size="default" className="w-full justify-start" onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
