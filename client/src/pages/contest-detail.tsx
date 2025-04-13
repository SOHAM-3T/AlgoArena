import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Trophy, 
  BookOpen, 
  Award, 
  Timer, 
  User as UserIcon, 
  Check, 
  AlarmClock, 
  Sparkles,
  LucideIcon
} from 'lucide-react';
import { Contest, Problem, User, ContestParticipant } from '@shared/schema';

export default function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contestId = parseInt(id);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Fetch contest details
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: [`/api/contests/${contestId}`],
    queryFn: async () => {
      const res = await fetch(`/api/contests/${contestId}`);
      if (!res.ok) throw new Error('Failed to fetch contest');
      return res.json() as Promise<Contest>;
    },
  });
  
  // Fetch problems for this contest
  const { data: problems = [], isLoading: problemsLoading } = useQuery({
    queryKey: [`/api/contests/${contestId}/problems`],
    queryFn: async () => {
      const res = await fetch(`/api/contests/${contestId}/problems`);
      if (!res.ok) throw new Error('Failed to fetch problems');
      return res.json() as Promise<Problem[]>;
    },
    enabled: !!contestId,
  });
  
  // Fetch contest participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: [`/api/contests/${contestId}/participants`],
    queryFn: async () => {
      const res = await fetch(`/api/contests/${contestId}/participants`);
      if (!res.ok) throw new Error('Failed to fetch participants');
      return res.json() as Promise<ContestParticipant[]>;
    },
    enabled: !!contestId,
  });
  
  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: [`/api/contests/${contestId}/leaderboard`],
    queryFn: async () => {
      const res = await fetch(`/api/contests/${contestId}/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json() as Promise<ContestParticipant[]>;
    },
    enabled: !!contestId,
  });
  
  // Check if user is registered for this contest
  const isRegistered = participants.some(p => user && p.userId === user.id);
  
  // Register for contest mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/contests/${contestId}/register`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contests/${contestId}/participants`] });
      toast({
        title: 'Registered successfully',
        description: 'You have successfully registered for this contest',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'There was an error registering for the contest',
        variant: 'destructive',
      });
    },
  });
  
  // Calculate contest status and timing
  const calculateContestStatus = () => {
    if (!contest) return '';
    
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    
    if (now < startTime) {
      return 'Upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'Active';
    } else {
      return 'Completed';
    }
  };
  
  // Update timer
  useEffect(() => {
    if (!contest) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);
      
      let timeLeft;
      let targetTime;
      
      if (now < startTime) {
        // Contest hasn't started yet
        targetTime = startTime;
        timeLeft = startTime.getTime() - now.getTime();
      } else if (now <= endTime) {
        // Contest is active
        targetTime = endTime;
        timeLeft = endTime.getTime() - now.getTime();
      } else {
        // Contest is over
        setTimeRemaining('Contest ended');
        return;
      }
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [contest]);
  
  // Register for contest
  const handleRegister = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    registerMutation.mutate();
  };
  
  // Start the contest
  const startContest = () => {
    if (problems.length > 0) {
      navigate(`/contests/${contestId}/problems/${problems[0].id}`);
    } else {
      toast({
        title: 'No problems available',
        description: 'This contest doesn\'t have any problems yet.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle loading state
  if (contestLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading contest...</p>
        </div>
      </div>
    );
  }
  
  // Handle 404
  if (!contest) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Contest Not Found</h2>
              <p className="text-slate-600 mb-6">The contest you're looking for doesn't exist or has been removed.</p>
              <Link href="/contests">
                <Button>View All Contests</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const contestStatus = calculateContestStatus();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{contest.title}</h1>
              <div className="flex items-center mt-2">
                <Badge 
                  className={`mr-2 ${
                    contestStatus === 'Active' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : contestStatus === 'Upcoming' 
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {contestStatus}
                </Badge>
                <span className="text-slate-500 text-sm">{contest.difficulty} Difficulty</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-slate-800 font-medium text-right">
                {contestStatus === 'Upcoming' ? 'Starts in' : 
                 contestStatus === 'Active' ? 'Time Remaining' : 'Contest Ended'}
              </div>
              <div className="text-xl font-semibold text-primary">{timeRemaining}</div>
            </div>
          </div>
          
          <Card className="bg-white border-slate-200 mt-4">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 text-slate-500 mr-2" />
                  <div>
                    <div className="text-sm text-slate-500">Start Date</div>
                    <div className="font-medium">{startTime.toLocaleDateString()}</div>
                    <div className="text-sm">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-slate-500 mr-2" />
                  <div>
                    <div className="text-sm text-slate-500">Duration</div>
                    <div className="font-medium">{durationHours} hours</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-slate-500 mr-2" />
                  <div>
                    <div className="text-sm text-slate-500">Problems</div>
                    <div className="font-medium">{problems.length}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-slate-500 mr-2" />
                  <div>
                    <div className="text-sm text-slate-500">Participants</div>
                    <div className="font-medium">{participants.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-slate-600">{contest.description}</p>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Created by</div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold mr-2">
                      A
                    </div>
                    <span className="font-medium">Admin</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  {contestStatus === 'Active' ? (
                    isRegistered ? (
                      <Button className="w-full sm:w-auto" onClick={startContest}>
                        <Trophy className="h-5 w-5 mr-2" /> Enter Contest
                      </Button>
                    ) : (
                      <Button 
                        className="w-full sm:w-auto" 
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                      >
                        <Trophy className="h-5 w-5 mr-2" /> 
                        {registerMutation.isPending ? 'Registering...' : 'Register & Start'}
                      </Button>
                    )
                  ) : contestStatus === 'Upcoming' ? (
                    isRegistered ? (
                      <Button variant="secondary" className="w-full sm:w-auto" disabled>
                        <Check className="h-5 w-5 mr-2" /> Registered
                      </Button>
                    ) : (
                      <Button 
                        className="w-full sm:w-auto" 
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                      >
                        <Trophy className="h-5 w-5 mr-2" /> 
                        {registerMutation.isPending ? 'Registering...' : 'Register for Contest'}
                      </Button>
                    )
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto"
                      onClick={() => setActiveTab('leaderboard')}
                    >
                      <Award className="h-5 w-5 mr-2" /> View Results
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contest Details</h3>
                <p className="text-slate-600 mb-6">{contest.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Rules</h4>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                      <li>You must be registered to participate in the contest.</li>
                      <li>The contest will be available for the duration specified above.</li>
                      <li>You'll be scored based on the correctness and efficiency of your solutions.</li>
                      <li>Each problem has a point value based on its difficulty.</li>
                      <li>Plagiarism will result in disqualification.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Scoring</h4>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                      <li>Points are awarded for each solved problem.</li>
                      <li>Partial points may be awarded for partially correct solutions.</li>
                      <li>Time penalties may be applied for incorrect submissions.</li>
                      <li>Final rankings are determined by total points earned.</li>
                      <li>Ties are broken by the earliest last successful submission time.</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold mb-4">Contest Schedule</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary mr-4">
                        <AlarmClock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Registration Opens</div>
                        <div className="text-slate-500 text-sm">
                          {new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                        <Timer className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Contest Starts</div>
                        <div className="text-slate-500 text-sm">
                          {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
                        <Timer className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Contest Ends</div>
                        <div className="text-slate-500 text-sm">
                          {endTime.toLocaleDateString()} at {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Results Announced</div>
                        <div className="text-slate-500 text-sm">
                          {new Date(endTime.getTime() + 2 * 60 * 60 * 1000).toLocaleDateString()} at {new Date(endTime.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="problems" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contest Problems</h3>
                
                {contestStatus === 'Upcoming' && !isRegistered ? (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Register to see problems</h3>
                    <p className="text-slate-600 mb-4">Problems will be available once you register for the contest.</p>
                    <Button 
                      onClick={handleRegister}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Registering...' : 'Register Now'}
                    </Button>
                  </div>
                ) : problemsLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading problems...</p>
                  </div>
                ) : problems.length > 0 ? (
                  <div className="space-y-4">
                    {problems.map((problem, index) => {
                      const difficulty = problem.difficulty;
                      const difficultyColor = 
                        difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800';
                      
                      return (
                        <Card key={problem.id} className="border border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-medium mr-3">
                                  {String.fromCharCode(65 + index)} {/* A, B, C, etc. */}
                                </div>
                                <div>
                                  <div className="font-medium">{problem.title}</div>
                                  <div className="text-sm text-slate-500">
                                    {problem.points} points • Time Limit: {problem.timeLimit}s
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <Badge className={`mr-3 ${difficultyColor}`}>
                                  {problem.difficulty}
                                </Badge>
                                
                                <Link href={`/contests/${contestId}/problems/${problem.id}`}>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={contestStatus === 'Upcoming'}
                                  >
                                    {contestStatus === 'Active' ? 'Solve' : 'View'}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No problems available</h3>
                    <p className="text-slate-600">Problems for this contest haven't been added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">Leaderboard</h3>
                
                {leaderboardLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participant</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {leaderboard.map((participant, index) => (
                          <tr key={participant.id} className={user && participant.userId === user.id ? 'bg-indigo-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{index + 1}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold mr-3">
                                  {participant.userId.toString().charAt(0)}
                                </div>
                                <div className="text-sm font-medium text-slate-900">
                                  User #{participant.userId} {user && participant.userId === user.id ? '(You)' : ''}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900">{participant.score} points</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {new Date(participant.registeredAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No participants yet</h3>
                    <p className="text-slate-600 mb-4">Be the first to join this contest!</p>
                    {!isRegistered && (
                      <Button 
                        onClick={handleRegister}
                        disabled={registerMutation.isPending || contestStatus === 'Completed'}
                      >
                        {registerMutation.isPending ? 'Registering...' : 'Register Now'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
