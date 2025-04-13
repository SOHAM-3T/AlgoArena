import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@/components/code-editor';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Menu as MenuIcon, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Timer,
  Eye
} from 'lucide-react';
import { Problem, Contest, Submission } from '@shared/schema';

export default function ProblemPage() {
  const { contestId, problemId } = useParams<{ contestId: string, problemId: string }>();
  const parsedContestId = parseInt(contestId);
  const parsedProblemId = parseInt(problemId);
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Fetch contest details
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: [`/api/contests/${parsedContestId}`],
    queryFn: async () => {
      const res = await fetch(`/api/contests/${parsedContestId}`);
      if (!res.ok) throw new Error('Failed to fetch contest');
      return res.json() as Promise<Contest>;
    },
  });
  
  // Fetch problems for this contest
  const { data: problems = [], isLoading: problemsLoading } = useQuery({
    queryKey: [`/api/contests/${parsedContestId}/problems`],
    queryFn: async () => {
      const res = await fetch(`/api/contests/${parsedContestId}/problems`);
      if (!res.ok) throw new Error('Failed to fetch problems');
      return res.json() as Promise<Problem[]>;
    },
    enabled: !!parsedContestId,
  });
  
  // Fetch current problem
  const { data: problem, isLoading: problemLoading } = useQuery({
    queryKey: [`/api/problems/${parsedProblemId}`],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${parsedProblemId}`);
      if (!res.ok) throw new Error('Failed to fetch problem');
      return res.json() as Promise<Problem>;
    },
    enabled: !!parsedProblemId,
  });
  
  // Fetch user submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/user/submissions'],
    queryFn: async () => {
      const res = await fetch('/api/user/submissions');
      if (!res.ok) throw new Error('Failed to fetch submissions');
      return res.json() as Promise<Submission[]>;
    },
    enabled: !!user,
  });
  
  // Filter submissions for this problem
  const problemSubmissions = submissions.filter(
    s => s.problemId === parsedProblemId
  ).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  
  // Get previous successful submission code if available
  const lastAcceptedSubmission = problemSubmissions.find(s => s.status === 'Accepted');
  const initialCode = lastAcceptedSubmission?.code || 
    problem?.sampleInput ? `# Use this template to solve the problem
def solve():
    # TODO: Implement your solution here
    pass

if __name__ == "__main__":
    # Parse input
    solve()
` : '';
  
  // Get current problem index in problems array
  const currentProblemIndex = problems.findIndex(p => p.id === parsedProblemId);
  
  // Previous and next problem navigation
  const prevProblem = currentProblemIndex > 0 ? problems[currentProblemIndex - 1] : null;
  const nextProblem = currentProblemIndex < problems.length - 1 ? problems[currentProblemIndex + 1] : null;
  
  // Update timer
  useEffect(() => {
    if (!contest) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endTime = new Date(contest.endTime);
      
      if (now > endTime) {
        setTimeRemaining('Contest ended');
        return;
      }
      
      const timeLeft = endTime.getTime() - now.getTime();
      
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
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Hard':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };
  
  // Handle loading states
  if (contestLoading || problemLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading problem...</p>
        </div>
      </div>
    );
  }
  
  // Handle 404
  if (!problem || !contest) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Problem Not Found</h2>
              <p className="text-slate-600 mb-6">The problem you're looking for doesn't exist or has been removed.</p>
              <Link href={`/contests/${parsedContestId}`}>
                <Button>Back to Contest</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex bg-slate-50">
      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-sm h-screen sticky top-0 ${mobileMenuOpen ? 'block' : 'hidden'} lg:block z-20 fixed lg:static`}>
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg> AlgoArena
            </span>
          </Link>
        </div>
        
        <div className="p-4 border-b">
          <h2 className="font-semibold text-slate-800">{contest.title}</h2>
          <div className="mt-2 flex flex-col space-y-1 text-sm">
            <div className="flex items-center text-slate-600">
              <Timer className="w-5 h-5 mr-1" />
              <span>Time Remaining: {timeRemaining}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Eye className="w-5 h-5 mr-1" />
              <span>Your Score: {problemSubmissions.reduce((total, sub) => total + sub.score, 0)}</span>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="px-3 py-2 text-xs font-medium uppercase text-slate-500">Problems</div>
          <ul className="space-y-1">
            {problems.map((p, index) => {
              // Find if user has submitted this problem
              const problemSubs = submissions.filter(s => s.problemId === p.id);
              const hasAccepted = problemSubs.some(s => s.status === 'Accepted');
              const hasAttempted = problemSubs.length > 0;
              
              return (
                <li key={p.id}>
                  <Link href={`/contests/${parsedContestId}/problems/${p.id}`}>
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      p.id === parsedProblemId ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-100'
                    }`}>
                      <span>{String.fromCharCode(65 + index)}. {p.title}</span>
                      <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs">
                        {hasAccepted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : hasAttempted ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">
                            {p.points}
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-8">
            <Link href={`/contests/${parsedContestId}/leaderboard`}>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Leaderboard</span>
              </div>
            </Link>
            
            <Link href={`/contests/${parsedContestId}`}>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Back to Contest</span>
              </div>
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Main content */}
      <div className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                type="button" 
                className="lg:hidden mr-4 text-slate-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Problem {String.fromCharCode(65 + currentProblemIndex)}: {problem.title}
                </h1>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Badge className={`mr-2 ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </Badge>
                  <span className="mr-4">Points: {problem.points}</span>
                  <span>Time Limit: {problem.timeLimit}s</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-slate-800 font-medium">Time Remaining</div>
              <div className="text-xl font-semibold text-primary">{timeRemaining}</div>
            </div>
          </div>
        </header>
        
        {/* Problem content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Problem description */}
            <div className="lg:col-span-2">
              <Card className="bg-white mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">Problem Description</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">{problem.description}</p>
                    
                    <h3 className="font-semibold text-lg mt-6 mb-2">Input Format</h3>
                    <p className="mb-4">{problem.inputFormat}</p>
                    
                    <h3 className="font-semibold text-lg mt-6 mb-2">Output Format</h3>
                    <p className="mb-4">{problem.outputFormat}</p>
                    
                    <h3 className="font-semibold text-lg mt-6 mb-2">Example</h3>
                    <div className="bg-slate-50 p-4 rounded">
                      <p className="font-semibold">Input:</p>
                      <pre className="bg-slate-100 p-3 rounded mt-1 mb-3 whitespace-pre-wrap">
                        {problem.sampleInput}
                      </pre>
                      <p className="font-semibold">Output:</p>
                      <pre className="bg-slate-100 p-3 rounded mt-1 whitespace-pre-wrap">
                        {problem.sampleOutput}
                      </pre>
                    </div>
                    
                    {problem.explanation && (
                      <>
                        <h3 className="font-semibold text-lg mt-6 mb-2">Explanation</h3>
                        <p className="mb-4">{problem.explanation}</p>
                      </>
                    )}
                    
                    <h3 className="font-semibold text-lg mt-6 mb-2">Constraints</h3>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Memory Limit: {problem.memoryLimit} MB</li>
                      <li>Time Limit: {problem.timeLimit} seconds</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* Code editor */}
              <CodeEditor 
                problemId={parsedProblemId} 
                contestId={parsedContestId} 
                initialCode={initialCode}
              />
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                {prevProblem ? (
                  <Link href={`/contests/${parsedContestId}/problems/${prevProblem.id}`}>
                    <Button variant="outline" className="flex items-center">
                      <ChevronLeft className="h-4 w-4 mr-2" /> Previous Problem
                    </Button>
                  </Link>
                ) : (
                  <div></div> 
                )}
                
                {nextProblem ? (
                  <Link href={`/contests/${parsedContestId}/problems/${nextProblem.id}`}>
                    <Button variant="outline" className="flex items-center">
                      Next Problem <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
            
            {/* Test cases & Submissions */}
            <div>
              <Tabs defaultValue="testcases" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="testcases">
                  <Card className="bg-white p-4 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Test Cases</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="font-medium text-slate-700">Example 1</div>
                        <Button variant="default" size="sm">
                          Run
                        </Button>
                      </div>
                      <div className="p-3">
                        <div className="mb-2">
                          <div className="text-xs font-medium text-slate-500 mb-1">Input:</div>
                          <div className="text-sm font-mono bg-slate-50 p-2 rounded">
                            {problem.sampleInput}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1">Expected Output:</div>
                          <div className="text-sm font-mono bg-slate-50 p-2 rounded">
                            {problem.sampleOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <Button variant="link" className="text-primary hover:text-indigo-700 text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Custom Test
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="submissions">
                  <Card className="bg-white p-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Your Submissions</h3>
                    <div className="divide-y divide-slate-200">
                      {problemSubmissions.length > 0 ? (
                        problemSubmissions.map((submission) => (
                          <div key={submission.id} className="py-3 flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <Badge className={`mr-2 ${
                                  submission.status === 'Accepted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : submission.status === 'Wrong Answer' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status}
                                </Badge>
                                <span className="text-sm text-slate-700">{submission.score}/{problem.points}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </div>
                            </div>
                            <Button variant="link" className="text-primary hover:text-indigo-700 text-sm">
                              View
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-slate-500">
                          You haven't submitted any solutions for this problem yet.
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
