import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, ChevronDown, Code, LogOut, Settings, User } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  showTimer?: boolean;
  timeRemaining?: string;
}

export function DashboardHeader({ title, showTimer, timeRemaining }: DashboardHeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <Code className="text-primary h-6 w-6 mr-2" />
              <span className="font-bold text-xl text-primary">AlgoArena</span>
            </a>
          </Link>
          {user?.role === 'admin' && (
            <span className="ml-2 px-2 py-1 bg-slate-100 text-xs font-medium rounded-md text-slate-600">
              Admin Portal
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {showTimer && timeRemaining && (
            <div className="px-3 py-1 bg-red-100 rounded-md text-sm flex items-center text-red-700 font-medium">
              <Bell className="mr-2 h-4 w-4" />
              <span>{timeRemaining} remaining</span>
            </div>
          )}
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-orange-500"></span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`} />
                    <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                    {user?.fullName}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {title && (
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
