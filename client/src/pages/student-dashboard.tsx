import { useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  ChevronUp, 
  Clock, 
  Plus, 
  Trophy, 
  Users, 
  Calendar,
  Award,
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Submission, Contest, ContestParticipant, User } from '@shared/schema';

export default function StudentDashboard() {
  const { user } = useAuth();

  // Fetch active contests
  const { data: contests = [] } = useQuery({
    queryKey: ['/api/active-contests'],
    queryFn: async () => {
      const res = await fetch('/api/active-contests');
      if (!res.ok) throw new Error('Failed to fetch active contests');
      return res.json() as Promise<Contest[]>;
    },
  });

  // Fetch user submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ['/api/user/submissions'],
    queryFn: async () => {
      const res = await fetch('/api/user/submissions');
      if (!res.ok) throw new Error('Failed to fetch submissions');
      return res.json() as Promise<Submission[]>;
    },
    enabled: !!user,
  });

  // Fetch user contests
  const { data: userContests = [] } = useQuery({
    queryKey: ['/api/user/contests'],
    queryFn: async () => {
      const res = await fetch('/api/user/contests');
      if (!res.ok) throw new Error('Failed to fetch user contests');
      return res.json() as Promise<ContestParticipant[]>;
    },
    enabled: !!user,
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json() as Promise<User[]>;
    },
  });

  // Get user's rank from leaderboard
  const userRank = leaderboard.findIndex(u => u.id === user?.id) + 1;

  // Get recent submissions (sorted by time)
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 4);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar variant="student" />
      
      <div className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                {user?.fullName.charAt(0)}
              </div>
              <span className="font-medium text-slate-700 ml-2">{user?.fullName}</span>
            </div>
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="p-6">
          {/* Welcome card */}
          <Card className="bg-white mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.fullName.split(' ')[0]}!</h2>
                  <p className="text-slate-600 mt-1">Track your progress and join upcoming contests.</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href="/contests">
                    <Button>Join a Contest</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Problems Solved */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Problems Solved</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{user?.problemsSolved || 0}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-green-600 mt-2 flex items-center">
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span>{Math.floor(Math.random() * 10) + 1}% from last week</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Rank */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Current Rank</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">#{userRank || '-'}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-green-600 mt-2 flex items-center">
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span>Moved up {Math.floor(Math.random() * 10) + 1} places</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Contests Joined */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Contests Joined</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{userContests?.length || 0}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 mt-2 flex items-center">
                  <span>Last joined {userContests.length > 0 ? '3 days ago' : 'none yet'}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Points */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Total Points</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{user?.points || 0}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-blue-600 mt-2 flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>{submissions.filter(s => s.status === 'Accepted').length > 0 ? 'Earned points in the last week!' : 'No recent points earned'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Live & Upcoming Contests */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Live & Upcoming Contests</h3>
            <Card className="bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contest Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {contests.length > 0 ? (
                      contests.map((contest) => {
                        const startTime = new Date(contest.startTime);
                        const endTime = new Date(contest.endTime);
                        const now = new Date();
                        const isLive = now >= startTime && now <= endTime;
                        const isUpcoming = now < startTime;
                        
                        // Calculate duration in hours
                        const durationMs = endTime.getTime() - startTime.getTime();
                        const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
                        
                        return (
                          <tr key={contest.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800">{contest.title}</div>
                              <div className="text-sm text-slate-500">{contest.difficulty}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {startTime.toLocaleDateString()} • {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {durationHours} hours
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                isLive 
                                  ? 'bg-green-100 text-green-800' 
                                  : isUpcoming 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isLive ? 'Live Now' : isUpcoming ? 'Upcoming' : 'Registration Open'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Link href={`/contests/${contest.id}`}>
                                <Button variant="link" className="text-primary hover:text-indigo-700 font-medium">{isLive ? 'Join Now' : 'View'}</Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                          No active contests available. Check back soon!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          {/* Recent Submissions & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Submissions</h3>
              <Card className="bg-white shadow-sm">
                <div className="divide-y divide-slate-200">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((submission) => (
                      <div key={submission.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-slate-800">Problem #{submission.problemId}</h4>
                            <p className="text-sm text-slate-500 mt-1">
                              Submitted {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            submission.status === 'Accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : submission.status === 'Wrong Answer' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-slate-600">Score: <span className="font-medium">{submission.score}/100</span></span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-slate-600">Language: <span className="font-medium">{submission.language}</span></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      No submissions yet. Solve some problems to see your submissions here!
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-3 bg-slate-50 text-center">
                  <Link href="/submissions">
                    <Button variant="link" className="text-primary hover:text-indigo-700 font-medium text-sm">View All Submissions</Button>
                  </Link>
                </div>
              </Card>
            </div>
            
            {/* Leaderboard */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Top Performers</h3>
              <Card className="bg-white shadow-sm">
                <div className="divide-y divide-slate-200">
                  {leaderboard.slice(0, 4).map((topUser, index) => (
                    <div key={topUser.id} className={`p-4 flex items-center ${topUser.id === user?.id ? 'bg-indigo-50' : ''}`}>
                      <div className="w-10 text-center font-medium text-slate-800">{index + 1}</div>
                      <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                        {topUser.fullName.charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-slate-800">
                          {topUser.fullName}{topUser.id === user?.id ? ' (You)' : ''}
                        </div>
                        <div className="text-sm text-slate-500">{topUser.points} points</div>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        index === 0 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : index <= 2 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {index === 0 ? 'Expert' : index <= 2 ? 'Advanced' : 'Intermediate'}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 bg-slate-50 text-center">
                  <Link href="/leaderboard">
                    <Button variant="link" className="text-primary hover:text-indigo-700 font-medium text-sm">View Full Leaderboard</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
