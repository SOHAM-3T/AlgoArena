import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { ProblemList } from '@/components/contest/problem-list';
import { ProblemDescription } from '@/components/contest/problem-description';
import { CodeEditor } from '@/components/ui/code-editor';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/contest/progress-bar';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BarChart2, HelpCircle } from 'lucide-react';
import { Problem, Contest } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContestPage() {
  const [_, params] = useRoute('/contest/:id');
  const contestId = params ? parseInt(params.id) : 0;
  
  const [activeProblemId, setActiveProblemId] = useState<number | null>(null);
  const [userSolvedProblems, setUserSolvedProblems] = useState<number[]>([]);
  
  // Fetch contest data
  const { data: contest, isLoading: isLoadingContest } = useQuery<Contest>({
    queryKey: [`/api/contests/${contestId}`],
    enabled: !!contestId,
  });
  
  // Fetch problems for this contest
  const { data: problems, isLoading: isLoadingProblems } = useQuery<Problem[]>({
    queryKey: [`/api/contests/${contestId}/problems`],
    enabled: !!contestId,
  });
  
  // Fetch user submissions for this contest (to determine which problems are solved)
  const { data: submissions } = useQuery<any[]>({
    queryKey: [`/api/submissions/contest/${contestId}`],
  });
  
  // Set the active problem to the first one when data loads
  useEffect(() => {
    if (problems && problems.length > 0 && !activeProblemId) {
      setActiveProblemId(problems[0].id);
    }
  }, [problems, activeProblemId]);
  
  // Determine which problems the user has solved
  useEffect(() => {
    if (submissions) {
      const solvedProblemIds = submissions
        .filter(s => s.status === 'Accepted')
        .map(s => s.problemId);
      
      // Remove duplicates
      setUserSolvedProblems([...new Set(solvedProblemIds)]);
    }
  }, [submissions]);
  
  // Get the currently active problem
  const activeProblem = problems?.find(p => p.id === activeProblemId);
  
  // Format the remaining time
  const formatTimeRemaining = () => {
    if (!contest) return "00:00:00";
    
    const now = new Date();
    const endTime = new Date(contest.endTime);
    
    if (now > endTime) return "Contest ended";
    
    const diffMs = endTime.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Progress stats
  const completedProblems = userSolvedProblems.length;
  const totalProblems = problems?.length || 0;
  const progressPercentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
  
  // Time progress
  const timeProgressPercentage = 72; // This would be calculated based on start and end times
  
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader 
        title={isLoadingContest ? "Loading contest..." : contest?.title}
        showTimer={true}
        timeRemaining={formatTimeRemaining()}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Problem List Sidebar */}
          <div className="w-full lg:w-64 lg:flex-shrink-0">
            {isLoadingProblems ? (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <Skeleton className="h-7 w-full mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : problems && problems.length > 0 ? (
              <ProblemList 
                problems={problems}
                activeProblemId={activeProblemId || undefined}
                userSolvedProblems={userSolvedProblems}
                onSelectProblem={setActiveProblemId}
              />
            ) : (
              <Card className="mb-6">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">No problems available for this contest.</p>
                </CardContent>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="p-4 bg-primary-50 border-b border-primary-100">
                <h2 className="font-medium text-primary-800">Your Progress</h2>
              </div>
              <CardContent className="p-4">
                <div className="text-sm font-medium flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
                    <span>{completedProblems}</span>
                  </div>
                  <span className="text-gray-500">
                    out of
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ml-2">
                    <span>{totalProblems}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <ProgressBar
                    label="Problems Solved"
                    percentage={progressPercentage}
                    color="green"
                  />
                  
                  <ProgressBar
                    label="Time Remaining"
                    percentage={timeProgressPercentage}
                    color="green"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Current Score: <span className="font-medium text-gray-900">150</span></span>
                    <span>Rank: <span className="font-medium text-gray-900">42 / 128</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problem and Code Editor */}
          <div className="flex-1">
            {/* Problem Description */}
            {isLoadingProblems || !activeProblem ? (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-64 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ) : (
              <ProblemDescription problem={activeProblem} />
            )}

            {/* Code Editor */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <Button variant="ghost" className="border-primary-500 text-primary-600 border-b-2 rounded-none px-6 py-4">
                    Code
                  </Button>
                  <Button variant="ghost" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 rounded-none px-6 py-4">
                    Submissions
                  </Button>
                </nav>
              </div>

              {activeProblem ? (
                <CodeEditor 
                  defaultCode={`def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here
    seen = {}
    for i, value in enumerate(nums):
        remaining = target - value
        
        if remaining in seen:
            return [seen[remaining], i]
            
        seen[value] = i`}
                  problemId={activeProblemId || 0}
                  contestId={contestId}
                />
              ) : (
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Select a problem to start coding.</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
