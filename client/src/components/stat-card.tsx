import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, color, isLoading = false }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-500';
      case 'green':
        return 'bg-green-100 text-green-500';
      case 'orange':
        return 'bg-orange-100 text-orange-500';
      case 'purple':
        return 'bg-purple-100 text-purple-500';
      case 'red':
        return 'bg-red-100 text-red-500';
      default:
        return 'bg-blue-100 text-blue-500';
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${getColorClasses()}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
