import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-2xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg> AlgoArena
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <span className={`font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : ''}`}>Home</span>
          </Link>
          <Link href="/contests">
            <span className={`font-medium hover:text-primary transition-colors ${location.includes('/contests') ? 'text-primary' : ''}`}>Contests</span>
          </Link>
          <Link href="/leaderboard">
            <span className={`font-medium hover:text-primary transition-colors ${location === '/leaderboard' ? 'text-primary' : ''}`}>Leaderboard</span>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="font-medium">{user.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'} className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMobileMenu} aria-label="Menu">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
          <Link href="/">
            <div className={`block px-3 py-2 rounded font-medium hover:bg-slate-100 ${location === '/' ? 'text-primary' : ''}`}>
              Home
            </div>
          </Link>
          <Link href="/contests">
            <div className={`block px-3 py-2 rounded font-medium hover:bg-slate-100 ${location.includes('/contests') ? 'text-primary' : ''}`}>
              Contests
            </div>
          </Link>
          <Link href="/leaderboard">
            <div className={`block px-3 py-2 rounded font-medium hover:bg-slate-100 ${location === '/leaderboard' ? 'text-primary' : ''}`}>
              Leaderboard
            </div>
          </Link>
          
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'}>
                <div className="block px-3 py-2 rounded font-medium hover:bg-slate-100">
                  Dashboard
                </div>
              </Link>
              <Link href="/profile">
                <div className="block px-3 py-2 rounded font-medium hover:bg-slate-100">
                  Profile
                </div>
              </Link>
              <div
                className="block px-3 py-2 rounded font-medium text-red-600 hover:bg-slate-100 cursor-pointer"
                onClick={() => logoutMutation.mutate()}
              >
                Log out
              </div>
            </>
          ) : (
            <>
              <Link href="/auth">
                <div className="block px-3 py-2 rounded font-medium text-primary hover:bg-slate-100">
                  Login
                </div>
              </Link>
              <Link href="/auth">
                <div className="block px-3 py-2 rounded font-medium bg-primary text-white hover:bg-primary/90">
                  Sign Up
                </div>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
