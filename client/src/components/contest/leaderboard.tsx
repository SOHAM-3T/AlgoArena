import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { User } from '@/types';

interface LeaderboardProps {
  users: User[];
  currentUserId?: number;
}

interface RankedUser extends User {
  rank: number;
  score: number;
}

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  // In a real app, we'd fetch real scores
  const rankedUsers: RankedUser[] = users
    .map(user => ({
      ...user,
      rank: 0, // Will be set below
      score: user.rating,
    }))
    .sort((a, b) => b.score - a.score)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Problems Solved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankedUsers.map((user) => (
            <TableRow 
              key={user.id} 
              className={user.id === currentUserId ? 'bg-primary-50' : ''}
            >
              <TableCell className="font-medium">{user.rank}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.username}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">{user.score}</TableCell>
              <TableCell className="text-right">{user.problemsSolved}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
