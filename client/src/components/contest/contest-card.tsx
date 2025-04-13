import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Contest } from '@/types';

interface ContestCardProps {
  contest: Contest;
  userRank?: number;
  isRegistered?: boolean;
}

function formatTimeRemaining(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  
  if (now > end) return "Ended";
  
  const diff = end.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

export function ContestCard({ contest, userRank, isRegistered }: ContestCardProps) {
  const timeRemaining = formatTimeRemaining(contest.endTime);
  const isActive = contest.status === 'active';
  const isEnded = contest.status === 'ended';
  const isUpcoming = contest.status === 'upcoming';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Card className={`overflow-hidden border ${isActive ? 'border-green-100' : ''}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={isActive ? "success" : isUpcoming ? "default" : "secondary"}>
              {isActive ? 'Live' : isUpcoming ? 'Upcoming' : 'Ended'}
            </Badge>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{contest.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {isActive ? 'Ends in' : isUpcoming ? 'Starts in' : 'Ended'}
            </p>
            <p className={`text-lg font-semibold ${isActive ? 'text-red-500' : 'text-gray-700'}`}>
              {timeRemaining}
            </p>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">{contest.description}</p>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-500">Difficulty:</span>
            <span className="font-medium ml-1 text-gray-900">{contest.difficulty}</span>
          </div>
          <Link href={isActive ? `/contest/${contest.id}` : `/contests`}>
            <Button 
              size="sm" 
              variant={isActive ? "default" : isEnded ? "outline" : "secondary"}
              disabled={isEnded}
            >
              {isActive ? 'Enter Contest' : isEnded ? 'View Results' : isRegistered ? 'Registered' : 'Register'}
            </Button>
          </Link>
        </div>
      </CardContent>
      
      {(isActive || isEnded) && userRank && (
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm flex justify-between w-full">
            <span className="font-medium text-gray-900">
              Participants: <span>128</span>
            </span>
            <span className="font-medium text-gray-900">
              Your Rank: <span>{userRank}</span>
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
