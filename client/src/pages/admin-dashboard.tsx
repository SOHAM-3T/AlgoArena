import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, UserPlus, Mail, User, Code, BarChart2, Trophy, Timer } from 'lucide-react';
import { Contest } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  // Fetch active contests
  const { data: contests, isLoading: isLoadingContests } = useQuery<Contest[]>({
    queryKey: ['/api/contests'],
    enabled: !!user && user.role === 'admin'
  });
  
  // Fetch users (for stats)
  const { data: users, isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ['/api/analytics/users'],
    enabled: !!user && user.role === 'admin'
  });
  
  // Fetch recent submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<any[]>({
    queryKey: ['/api/analytics/submissions'],
    enabled: !!user && user.role === 'admin'
  });
  
  // Stats
  const stats = {
    totalStudents: users?.filter(u => u.role === 'student').length || 0,
    activeContests: contests?.filter(c => c.status === 'active').length || 0,
    totalProblems: 124, // This would come from an API in a real implementation
    submissionsToday: submissions?.filter(s => {
      const today = new Date();
      const submissionDate = new Date(s.submitTime);
      return submissionDate.toDateString() === today.toDateString();
    }).length || 0
  };
  
  // Format date
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
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-blue-100 text-blue-500">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isLoadingUsers ? <Skeleton className="h-6 w-16" /> : stats.totalStudents}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-green-100 text-green-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Contests</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isLoadingContests ? <Skeleton className="h-6 w-10" /> : stats.activeContests}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-orange-100 text-orange-500">
                    <Code className="h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Problems</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalProblems}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-purple-100 text-purple-500">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Submissions Today</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isLoadingSubmissions ? <Skeleton className="h-6 w-12" /> : stats.submissionsToday}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-6 justify-start bg-white shadow-sm hover:bg-gray-50">
                <PlusCircle className="h-5 w-5 text-primary mr-3" />
                <span className="font-medium">Create New Contest</span>
              </Button>
              <Button variant="outline" className="h-auto p-6 justify-start bg-white shadow-sm hover:bg-gray-50">
                <Code className="h-5 w-5 text-primary mr-3" />
                <span className="font-medium">Add New Problem</span>
              </Button>
              <Button variant="outline" className="h-auto p-6 justify-start bg-white shadow-sm hover:bg-gray-50">
                <UserPlus className="h-5 w-5 text-primary mr-3" />
                <span className="font-medium">Invite Students</span>
              </Button>
            </div>
          </div>

          {/* Current Contests */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Current Contests</h2>
          <Card className="mb-8 overflow-hidden">
            {isLoadingContests ? (
              <div className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : contests && contests.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contest Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contests.map((contest) => (
                      <TableRow key={contest.id}>
                        <TableCell>
                          <div className="font-medium">{contest.title}</div>
                          <div className="text-sm text-muted-foreground">5 problems</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contest.status === 'active' ? 'success' : 
                                        contest.status === 'upcoming' ? 'default' : 'secondary'}>
                            {contest.status === 'active' ? 'Active' : 
                             contest.status === 'upcoming' ? 'Draft' : 'Ended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contest.status === 'active' ? (
                            <>
                              <div className="font-medium">128 students</div>
                              <div className="text-sm text-muted-foreground">583 submissions</div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">--</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {contest.endTime ? (
                            <>
                              <div>{formatDate(contest.endTime).split(',')[0]}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(contest.endTime).split(',')[1]}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">Not scheduled</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/contests/${contest.id}`}>
                            <Button variant="link" className="mr-2">Manage</Button>
                          </Link>
                          <Link href={`/contests/${contest.id}/leaderboard`}>
                            <Button variant="link">View Leaderboard</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No contests available. Create your first contest now.</p>
                <Button className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Contest
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Recent Activity & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSubmissions ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.slice(0, 4).map((submission, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=User${submission.userId}`} />
                          <AvatarFallback>U{submission.userId}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            User #{submission.userId}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Problem #{submission.problemId}
                          </p>
                        </div>
                        <Badge variant={submission.status === "Accepted" ? "success" : "destructive"}>
                          {submission.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(submission.submitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4">View all</Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No recent submissions</p>
                )}
              </CardContent>
            </Card>
            
            {/* Top Performing Students */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-4 w-16 mb-2" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users
                      .filter(u => u.role === 'student')
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 4)
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center space-x-4">
                          <div className="text-lg font-semibold text-gray-600">#{index + 1}</div>
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} />
                            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{user.rating} pts</p>
                            <p className="text-sm text-gray-500">{user.problemsSolved} problems</p>
                          </div>
                        </div>
                      ))}
                    <Button variant="outline" className="w-full mt-4">View full leaderboard</Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No student data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
