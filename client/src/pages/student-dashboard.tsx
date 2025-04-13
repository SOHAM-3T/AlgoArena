import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Sidebar } from '@/components/layout/sidebar';
import { ContestCard } from '@/components/contest/contest-card';
import { ProgressBar } from '@/components/contest/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Contest, Submission } from '@/types';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Fetch active contests
  const { data: activeContests, isLoading: isLoadingActiveContests } = useQuery<Contest[]>({
    queryKey: ['/api/contests/active'],
    enabled: !!user
  });
  
  // Fetch upcoming contests
  const { data: upcomingContests, isLoading: isLoadingUpcomingContests } = useQuery<Contest[]>({
    queryKey: ['/api/contests/upcoming'],
    enabled: !!user
  });
  
  // Fetch user submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<Submission[]>({
    queryKey: ['/api/submissions/user'],
    enabled: !!user
  });
  
  // Performance by category (mocked for now)
  const performanceData = [
    { category: 'Dynamic Programming', percentage: 72, color: 'green' },
    { category: 'Graph Algorithms', percentage: 65, color: 'green' },
    { category: 'Data Structures', percentage: 84, color: 'green' },
    { category: 'Sorting & Searching', percentage: 91, color: 'green' },
    { category: 'Greedy Algorithms', percentage: 58, color: 'yellow' },
  ];
  
  // Recent submissions (using data from API or fallback to mock data)
  const recentSubmissions = submissions?.slice(0, 5) || [];
  
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Your current rating is <span className="font-semibold text-primary-600">{user?.rating}</span> points
              </p>
              <div className="mt-4 flex space-x-4">
                <div className="text-sm">
                  <span className="text-gray-500">Rank:</span>
                  <span className="font-medium ml-1 text-gray-900">87</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Problems Solved:</span>
                  <span className="font-medium ml-1 text-gray-900">{user?.problemsSolved}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Contests Participated:</span>
                  <span className="font-medium ml-1 text-gray-900">{user?.contestsParticipated}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Contests */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Contests</h2>
          {isLoadingActiveContests ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-9 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeContests && activeContests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {activeContests.map(contest => (
                <ContestCard 
                  key={contest.id}
                  contest={contest}
                  userRank={Math.floor(Math.random() * 100) + 1} // Mock rank
                  isRegistered={true}
                />
              ))}
            </div>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No active contests at the moment.</p>
                <p className="text-gray-500 mt-1">Check back later or browse upcoming contests.</p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Contests */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Contests</h2>
          {isLoadingUpcomingContests ? (
            <Card className="mb-8">
              <CardContent className="p-0">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ) : upcomingContests && upcomingContests.length > 0 ? (
            <Card className="mb-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Register</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingContests.map(contest => {
                      const startDate = new Date(contest.startTime);
                      const endDate = new Date(contest.endTime);
                      const durationHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
                      
                      return (
                        <tr key={contest.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{contest.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {startDate.toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{durationHours} hours</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={contest.difficulty === "Easy" ? "success" : contest.difficulty === "Hard" ? "destructive" : "default"}>
                              {contest.difficulty}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/contests/${contest.id}`}>
                              <Button variant="link">Register</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No upcoming contests scheduled.</p>
              </CardContent>
            </Card>
          )}

          {/* Your Progress */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Performance By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map(item => (
                    <ProgressBar
                      key={item.category}
                      label={item.category}
                      percentage={item.percentage}
                      color={item.color as 'green' | 'yellow' | 'red'}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSubmissions ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : recentSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSubmissions.map((submission, index) => (
                      <div key={submission.id || index} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Problem #{submission.problemId}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submitTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={submission.status === "Accepted" ? "success" : "destructive"}>
                          {submission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No submissions yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
