"use client"

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { BriefcaseBusiness, HelpCircle, IndianRupee, LayoutDashboard, LogOut, Menu, Settings, Users } from "lucide-react";
import { useState } from "react";


const NAV_ITEMS = [
  { id: "Dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "Timeline", label: "Timeline", href:"/Timeline", icon: <BriefcaseBusiness size={18} /> },
  { id: "Teams", label: "Teams", href: "/settings", icon: <Users size={18} /> },
  { id: "Billings", label: "billings", href: "/", icon: <IndianRupee size={18} /> },
];

const NAV_BELOW = [
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings size={18} /> },
  { id: "help", label: "Help", href: "/help", icon: <HelpCircle size={18} /> },
  { id: "logout", label: "Log Out", href: "/logout", icon: <LogOut size={18} /> },
];

export default function Sidebar({ items = NAV_ITEMS }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className="flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-screen sticky top-0">
        <motion.nav
          initial={{ width: collapsed ? 72 : 260 }}
          animate={{ width: collapsed ? 72 : 260 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="bg-white border-r h-full flex flex-col"
          aria-label="Main Navigation"
        >
          <div className="flex items-center justify-between px-4 h-16 border-b">
            <div className="flex items-center gap-3">
              {!collapsed && (
                <span className="font-semibold">Case-Management</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-2"
            >
              <Menu size={18} />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3">
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it.id}>
                  <a
                    href={it.href}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      collapsed ? "justify-center" : "justify-start"
                    }`}
                  >
                    <span className="opacity-90">{it.icon}</span>
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t my-3" />
            <ul className="space-y-1">
              {NAV_BELOW.map((it) => (
                <li key={it.id}>
                  <a
                    href={it.href}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      collapsed ? "justify-center" : "justify-start"
                    }`}
                  >
                    <span className="opacity-90">{it.icon}</span>
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </ScrollArea>

          <div className="pl-5 py-4 border-t">
            <div
              className={`flex items-center justify-between ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                {!collapsed && (
                  <div>
                    <div className="text-sm font-medium">Your Name</div>
                    <div className="text-xs text-gray-500">Organizer</div>
                  </div>
                )}
              </div>

              {!collapsed ? (
                <Button variant="ghost" size="sm">
                  Sign out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="p-2">
                  {" "}
                  <LogOut size={16} />
                </Button>
              )}
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="p-2">
              <Menu size={18} />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-full max-w-xs p-0">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 h-16 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-200 to-gray-200 flex items-center justify-center text-white font-bold">
                    <p className="text-black font-light">D</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    Applications
                  </span>
                </div>
                <SheetTrigger asChild className="pt-2">
                </SheetTrigger>
              </div>

              <ScrollArea className="p-3 flex-1">
                <ul className="space-y-1">
                  {items.map((it) => (
                    <li key={it.id}>
                      <a
                        href={it.href}
                        className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="opacity-90">{it.icon}</span>
                        <span className="truncate">{it.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </ScrollArea>

              <div className="px-3 py-3 border-t">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="text-sm font-medium">Your Name</div>
                      <div className="text-xs text-gray-500">Your Email</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="dark:text-amber-100 "
                    size="sm"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1 md:block hidden" aria-hidden />
    </aside>
  );
}
