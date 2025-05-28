"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';

interface UserAvatarProps {
  className?: string;
}

export default function UserAvatar({ className = "" }: UserAvatarProps) {
  const { signOut } = useAuth();
  const { mockUser } = useAppContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/login');
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Avatar 
        className="cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
          {mockUser.initials}
        </AvatarFallback>
      </Avatar>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                  {mockUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mockUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Agentsly AI User
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none"
              onClick={handleSettings}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
