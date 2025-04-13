import React from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Contest } from '@/types';

interface UpcomingContestsTableProps {
  contests: Contest[];
  isLoading: boolean;
}

export function UpcomingContestsTable({ contests, isLoading }: UpcomingContestsTableProps) {
  if (isLoading) {
    return (
      <Card className="mb-8">
        <div className="p-0">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }
  
  if (!contests || contests.length === 0) {
    return (
      <Card className="mb-8">
        <div className="p-6 text-center">
          <p className="text-gray-500">No upcoming contests scheduled.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contest Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contests.map(contest => {
              const startDate = new Date(contest.startTime);
              const endDate = new Date(contest.endTime);
              const durationHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
              
              return (
                <TableRow key={contest.id}>
                  <TableCell className="font-medium">{contest.title}</TableCell>
                  <TableCell>
                    <div>{startDate.toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>{durationHours} hours</TableCell>
                  <TableCell>
                    <Badge variant={
                      contest.difficulty === "Easy" ? "success" : 
                      contest.difficulty === "Hard" ? "destructive" : 
                      "default"
                    }>
                      {contest.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/contests/${contest.id}`}>
                      <Button variant="link">Register</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
