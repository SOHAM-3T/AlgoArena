import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Menu, Home, Trophy, User, Settings, LogOut, Code, Send, Award, GraduationCap, BarChart, Users } from 'lucide-react';

type SidebarProps = {
  variant: 'student' | 'admin';
}

export function Sidebar({ variant }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white shadow-sm h-screen sticky top-0 hidden lg:block">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg> AlgoArena
            </span>
          </Link>
        </div>
        
        <nav className="p-4">
          {variant === 'admin' && <div className="px-3 py-2 text-xs font-medium uppercase text-slate-500">Admin Panel</div>}
          <ul className="space-y-1">
            <li>
              <Link href={variant === 'admin' ? "/dashboard/admin" : "/dashboard/student"}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location.includes('/dashboard') ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/contests">
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/contests' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Trophy className="h-5 w-5" />
                  <span>Contests</span>
                </div>
              </Link>
            </li>
            
            {variant === 'student' && (
              <>
                <li>
                  <Link href="/problems">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/problems' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Code className="h-5 w-5" />
                      <span>Problems</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/submissions">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/submissions' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Send className="h-5 w-5" />
                      <span>Submissions</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/leaderboard' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Award className="h-5 w-5" />
                      <span>Leaderboard</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/learn">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/learn' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <GraduationCap className="h-5 w-5" />
                      <span>Learning</span>
                    </div>
                  </Link>
                </li>
              </>
            )}
            
            {variant === 'admin' && (
              <>
                <li>
                  <Link href="/admin/problems">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/admin/problems' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Code className="h-5 w-5" />
                      <span>Problem Bank</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/admin/users' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Users className="h-5 w-5" />
                      <span>User Management</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/analytics">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/admin/analytics' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <BarChart className="h-5 w-5" />
                      <span>Analytics</span>
                    </div>
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <div className="mt-8 pt-4 border-t">
            <div className="px-3 py-2 text-xs font-medium uppercase text-slate-500">Account</div>
            <ul className="space-y-1">
              <li>
                <Link href="/profile">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </div>
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
      
      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      {/* Mobile Sidebar */}
      {collapsed && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setCollapsed(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-primary text-xl font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg> AlgoArena
                </span>
              </Link>
            </div>
            
            <nav className="p-4">
              {variant === 'admin' && <div className="px-3 py-2 text-xs font-medium uppercase text-slate-500">Admin Panel</div>}
              <ul className="space-y-1">
                <li>
                  <Link href={variant === 'admin' ? "/dashboard/admin" : "/dashboard/student"}>
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location.includes('/dashboard') ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                </li>
                
                {/* Same navigation items as desktop */}
                <li>
                  <Link href="/contests">
                    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/contests' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <Trophy className="h-5 w-5" />
                      <span>Contests</span>
                    </div>
                  </Link>
                </li>
                
                {variant === 'student' && (
                  <>
                    <li>
                      <Link href="/problems">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/problems' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <Code className="h-5 w-5" />
                          <span>Problems</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/submissions">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/submissions' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <Send className="h-5 w-5" />
                          <span>Submissions</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/leaderboard">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/leaderboard' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <Award className="h-5 w-5" />
                          <span>Leaderboard</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/learn">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/learn' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <GraduationCap className="h-5 w-5" />
                          <span>Learning</span>
                        </div>
                      </Link>
                    </li>
                  </>
                )}
                
                {variant === 'admin' && (
                  <>
                    <li>
                      <Link href="/admin/problems">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/admin/problems' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <Code className="h-5 w-5" />
                          <span>Problem Bank</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/users">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/admin/users' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <Users className="h-5 w-5" />
                          <span>User Management</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/analytics">
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/admin/analytics' ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <BarChart className="h-5 w-5" />
                          <span>Analytics</span>
                        </div>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              
              <div className="mt-8 pt-4 border-t">
                <div className="px-3 py-2 text-xs font-medium uppercase text-slate-500">Account</div>
                <ul className="space-y-1">
                  <li>
                    <Link href="/profile">
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings">
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
