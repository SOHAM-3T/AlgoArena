import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Edit, 
  Eye, 
  PenSquare, 
  Plus, 
  Trash, 
  Trophy, 
  Users as UsersIcon
} from 'lucide-react';
import { Contest, User, Submission } from '@shared/schema';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch contests
  const { data: contests = [] } = useQuery({
    queryKey: ['/api/contests'],
    queryFn: async () => {
      const res = await fetch('/api/contests');
      if (!res.ok) throw new Error('Failed to fetch contests');
      return res.json() as Promise<Contest[]>;
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json() as Promise<User[]>;
    },
  });

  // Calculate stats
  const activeContests = contests.filter(contest => contest.status === 'Active').length;
  const totalStudents = students.length;
  const totalProblems = contests.reduce((sum, contest) => sum + 3, 0); // Assuming ~3 problems per contest
  
  // For total submissions, we're providing a placeholder since we don't have that specific API endpoint
  const totalSubmissions = contests.length * 15; // Placeholder: ~15 submissions per contest

  // Mock recent activity for display (for UI demonstration only)
  const recentActivity = [
    {
      id: 1,
      type: 'submission',
      user: { id: 1, initials: 'SJ', name: 'Sarah Johnson' },
      action: 'submitted a solution',
      details: 'Binary Search Implementation - Accepted',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'registration',
      user: { id: 2, initials: 'RB', name: 'Ryan Brown' },
      action: 'registered for a contest',
      details: 'Data Structures Challenge',
      time: '3 hours ago'
    },
    {
      id: 3,
      type: 'submission',
      user: { id: 3, initials: 'JS', name: 'John Smith' },
      action: 'submitted a solution',
      details: 'Two Sum Problem - Wrong Answer',
      time: '5 hours ago'
    },
    {
      id: 4,
      type: 'registration',
      user: { id: 4, initials: 'MK', name: 'Maria Kim' },
      action: 'registered for a contest',
      details: 'Weekly Code Sprint #12',
      time: '8 hours ago'
    }
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar variant="admin" />
      
      <div className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-800">Admin Dashboard</h1>
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
                  <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.fullName}</h2>
                  <p className="text-slate-600 mt-1">Manage contests, problems, and track student performance.</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href="/admin/contests/new">
                    <Button className="flex items-center">
                      <Plus className="h-4 w-4 mr-1" />
                      Create New Contest
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Active Contests */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Active Contests</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{activeContests}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 mt-2 flex items-center">
                  <span>{activeContests > 0 ? `${Math.floor(activeContests / 2)} ending soon` : 'No active contests'}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Total Students */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Total Students</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalStudents}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UsersIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-green-600 mt-2 flex items-center">
                  <span>{totalStudents > 0 ? 'Active community' : 'No students registered yet'}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Problems Created */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Problems Created</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalProblems}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <PenSquare className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-blue-600 mt-2 flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>{contests.length > 0 ? 'Create more problems!' : 'Add your first problem'}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Submissions */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Total Submissions</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalSubmissions}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <BarChart className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 mt-2 flex items-center">
                  <span>{totalSubmissions > 0 ? 'View detailed analytics' : 'No submissions yet'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active & Upcoming Contests */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Active & Upcoming Contests</h3>
              <Link href="/admin/contests">
                <Button variant="link" className="text-primary hover:text-indigo-700 text-sm font-medium">View All</Button>
              </Link>
            </div>
            
            <Card className="bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contest Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participants</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {contests.length > 0 ? (
                      contests.slice(0, 3).map((contest) => {
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {Math.floor(Math.random() * 100) + 10} students
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/admin/contests/${contest.id}/leaderboard`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <BarChart className="h-4 w-4 text-slate-700 hover:text-primary" />
                                  </Button>
                                </Link>
                                <Link href={`/admin/contests/${contest.id}/edit`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4 text-slate-700 hover:text-primary" />
                                  </Button>
                                </Link>
                                <Link href={`/admin/contests/${contest.id}`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4 text-slate-700 hover:text-primary" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash className="h-4 w-4 text-red-600 hover:text-red-800" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                          No contests available. Create your first contest!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          {/* Recent Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h3>
              <Card className="bg-white p-4">
                <div className="divide-y divide-slate-200">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className={activity.id === 1 ? 'pb-4 mb-4' : 'py-4 mb-4'}>
                      <div className="flex">
                        <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                          {activity.user.initials}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-slate-800">{activity.user.name} {activity.action}</div>
                          <p className="text-sm text-slate-500">{activity.details}</p>
                          <span className="text-xs text-slate-400">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Link href="/admin/activity">
                    <Button variant="link" className="text-primary hover:text-indigo-700 font-medium text-sm">View All Activity</Button>
                  </Link>
                </div>
              </Card>
            </div>
            
            {/* Top Performers */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Top Performing Students</h3>
              <Card className="bg-white">
                <div className="divide-y divide-slate-200">
                  {students.slice(0, 4).map((student, index) => (
                    <div key={student.id} className="p-4 flex items-center">
                      <div className="w-10 text-center font-medium text-slate-800">{index + 1}</div>
                      <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-slate-800">{student.fullName}</div>
                        <div className="text-sm text-slate-500">{student.points} points • {student.problemsSolved} problems solved</div>
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
                  <Link href="/admin/students">
                    <Button variant="link" className="text-primary hover:text-indigo-700 font-medium text-sm">View All Students</Button>
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
