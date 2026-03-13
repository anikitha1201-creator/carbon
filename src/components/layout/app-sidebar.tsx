"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Zap,
  BarChart3,
  Settings,
  Leaf
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Fleet Management", icon: Truck, url: "/fleet" },
  { title: "Order Queue", icon: Package, url: "/orders" },
  { title: "Driver Directory", icon: Users, url: "/drivers" },
  { title: "Scenario Simulator", icon: Zap, url: "/simulation" },
  { title: "Sustainability", icon: Leaf, url: "/analytics" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-start py-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold tracking-tight text-primary">CAFS</span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Carbon-Aware Fleet</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="py-6 px-4 h-12"
              >
                <Link href={item.url}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl bg-accent/10 p-4 border border-accent/20">
          <p className="text-xs font-semibold text-accent mb-1 flex items-center gap-1">
             <Zap className="h-3 w-3" /> Live Grid Sync
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-foreground">142</span>
            <span className="text-[10px] text-muted-foreground pb-1">gCO₂/kWh</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
             <div className="h-full bg-accent w-3/4 rounded-full" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}