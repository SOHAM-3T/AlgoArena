import React, { ReactNode } from 'react';
import { DashboardHeader } from './dashboard-header';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showTimer?: boolean;
  timeRemaining?: string;
}

export function DashboardLayout({ 
  children, 
  title, 
  showTimer, 
  timeRemaining 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader 
        title={title}
        showTimer={showTimer}
        timeRemaining={timeRemaining}
      />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
