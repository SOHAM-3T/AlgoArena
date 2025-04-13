import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Filter, 
  Trophy
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contest } from '@shared/schema';

export default function ContestsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch all contests
  const { data: contests = [], isLoading } = useQuery({
    queryKey: ['/api/contests'],
    queryFn: async () => {
      const res = await fetch('/api/contests');
      if (!res.ok) throw new Error('Failed to fetch contests');
      return res.json() as Promise<Contest[]>;
    },
  });

  // Filter contests based on search term and filters
  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         contest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || contest.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || contest.status === statusFilter;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // Sort contests: Active first, then Upcoming, then Registration Open
  const sortedContests = [...filteredContests].sort((a, b) => {
    const statusPriority = { Active: 0, Upcoming: 1, 'Registration Open': 2, Completed: 3 };
    return (statusPriority[a.status as keyof typeof statusPriority] || 4) - 
           (statusPriority[b.status as keyof typeof statusPriority] || 4);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Coding Contests</h1>
            <p className="text-slate-600 mb-6">Participate in timed coding challenges, test your skills, and compete with other programmers.</p>
            
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search contests..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Registration Open">Registration Open</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Create Contest button (admin only) */}
            {user?.role === 'admin' && (
              <div className="mb-6">
                <Link href="/admin/contests/new">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    <Trophy className="h-5 w-5 mr-2" /> Create New Contest
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Contest cards */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading contests...</p>
              </div>
            ) : sortedContests.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContests.map((contest) => {
                  const startTime = new Date(contest.startTime);
                  const endTime = new Date(contest.endTime);
                  const now = new Date();
                  const isActive = contest.status === 'Active';
                  const isCompleted = contest.status === 'Completed';
                  const isUpcoming = contest.status === 'Upcoming';
                  
                  // Calculate duration in hours
                  const durationMs = endTime.getTime() - startTime.getTime();
                  const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
                  
                  // Status color styling
                  const statusColorClasses = {
                    'Active': 'bg-green-100 text-green-800',
                    'Registration Open': 'bg-yellow-100 text-yellow-800',
                    'Upcoming': 'bg-blue-100 text-blue-800',
                    'Completed': 'bg-slate-100 text-slate-800'
                  };
                  
                  return (
                    <Card key={contest.id} className="bg-white shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                      <div className={`p-1 ${statusColorClasses[contest.status as keyof typeof statusColorClasses]} text-center text-sm font-medium`}>
                        {contest.status}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{contest.title}</h3>
                        <p className="text-slate-600 mb-4">{contest.description}</p>
                        
                        <div className="flex items-center text-slate-500 mb-4">
                          <div className="flex items-center mr-4">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{startTime.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{durationHours} hours</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 flex items-center">
                            <Users className="h-3 w-3 mr-1" /> {Math.floor(Math.random() * 100) + 10} participants
                          </div>
                          
                          <Link href={`/contests/${contest.id}`}>
                            <Button 
                              variant={isCompleted ? "secondary" : "default"} 
                              disabled={isCompleted} 
                              size="sm"
                            >
                              {isActive ? 'Join Now' : isUpcoming ? 'View Details' : isCompleted ? 'Completed' : 'Register'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm p-8">
                <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No contests found</h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm || difficultyFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters to find contests.' 
                    : 'There are no contests available at the moment. Check back soon!'}
                </p>
                {(searchTerm || difficultyFilter !== 'all' || statusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setDifficultyFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Past contests section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Past Contests</h2>
            
            <Card className="bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contest Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participants</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Difficulty</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {contests.filter(c => c.status === 'Completed').slice(0, 5).map((contest) => (
                      <tr key={contest.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800">{contest.title}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {new Date(contest.startTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {Math.floor(Math.random() * 100) + 10}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            contest.difficulty === 'Beginner' 
                              ? 'bg-green-100 text-green-800' 
                              : contest.difficulty === 'Intermediate' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {contest.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link href={`/contests/${contest.id}`}>
                            <Button variant="link" className="text-primary hover:text-indigo-700">View Results</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    
                    {contests.filter(c => c.status === 'Completed').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                          No past contests available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
