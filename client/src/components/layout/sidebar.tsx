import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  Trophy, 
  Code, 
  BarChart2, 
  Book, 
  User, 
  Settings, 
  Users, 
  PlusCircle 
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  adminOnly?: boolean;
}

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const isAdmin = user?.role === 'admin';
  
  const sidebarItems: SidebarItem[] = [
    { icon: <Home className="text-gray-500" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Trophy className="text-gray-500" />, label: isAdmin ? 'Manage Contests' : 'Contests', href: '/contests' },
    { icon: <Code className="text-gray-500" />, label: isAdmin ? 'Problem Bank' : 'Practice', href: '/practice' },
    { icon: <BarChart2 className="text-gray-500" />, label: isAdmin ? 'Student Analytics' : 'Leaderboard', href: '/leaderboard' },
    { icon: <Book className="text-gray-500" />, label: 'Resources', href: '/resources' },
    { icon: <Users className="text-gray-500" />, label: 'User Management', href: '/users', adminOnly: true },
    { icon: <User className="text-gray-500" />, label: 'Profile', href: '/profile' },
    { icon: <Settings className="text-gray-500" />, label: 'Settings', href: '/settings' },
  ];
  
  const filteredItems = sidebarItems.filter(item => !item.adminOnly || isAdmin);
  
  return (
    <aside className="w-64 bg-white shadow-sm hidden md:block min-h-screen">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a 
                  className={cn(
                    "flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100",
                    location === item.href && "bg-gray-100"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
