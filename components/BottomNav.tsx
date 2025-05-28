"use client";

import React from 'react';
import { MessageSquare, ListChecks, Settings, LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/contexts/AppContext'; // Assuming AppContext provides navigateTo and currentScreen or similar
import { usePathname } from 'next/navigation'; // To determine active screen

interface NavItem {
  name: string;
  screenPath: string; // Path for Next.js router
  icon: LucideIcon;
}

export default function BottomNav() {
  const { navigateTo } = useAppContext();
  const pathname = usePathname(); // Get current path

  const navItems: NavItem[] = [
    { name: 'Ask', screenPath: '/', icon: MessageSquare },
    { name: 'Follow Up', screenPath: '/follow-ups', icon: ListChecks },
    { name: 'Settings', screenPath: '/settings', icon: Settings },
  ];

  // Determine if the BottomNav should be visible based on the current path
  // It should be visible for '/', '/follow-ups', and '/settings'
  const visiblePaths = ['/', '/follow-ups', '/settings'];
  if (!visiblePaths.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around p-2 nav-enhanced max-w-md mx-auto">
      {navItems.map(item => {
        const isActive = pathname === item.screenPath;
        const Icon = item.icon;
        return (
          <Button
            key={item.name}
            variant="ghost"
            className={`flex flex-col items-center h-auto p-2 rounded-md btn-enhanced ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => navigateTo(item.screenPath)}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-xs text-readable ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
          </Button>
        );
      })}
    </nav>
  );
}
