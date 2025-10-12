"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/home",
      icon: Home,
      label: "Home",
    },
    {
      href: "/tasks",
      icon: Home,
      label: "Tasks",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-3 px-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-soft-primary/20 text-soft-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-card-bg-secondary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
