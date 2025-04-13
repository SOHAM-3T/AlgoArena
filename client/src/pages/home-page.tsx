import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, Clock, Users, Trophy, GraduationCap, Code } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch contests
  const { data: contests = [] } = useQuery({
    queryKey: ['/api/contests'],
    queryFn: async () => {
      const res = await fetch('/api/contests');
      if (!res.ok) throw new Error('Failed to fetch contests');
      return res.json();
    },
    enabled: true,
  });
  
  const upcomingContests = contests.slice(0, 3);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Master Algorithms, Compete & Grow</h1>
              <p className="text-xl mb-8 text-indigo-100">Join AlgoArena's competitive programming platform to challenge yourself, solve problems, and climb the leaderboards.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href={user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student') : '/auth'}>
                  <Button size="lg" className="bg-white text-primary hover:bg-indigo-50">
                    Get Started
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-10">
              <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
                <div className="p-4 bg-slate-900 flex items-center">
                  <div className="flex space-x-2">
                    <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                    <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
                    <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="ml-4 text-gray-400 text-sm">Binary Search Problem.py</div>
                </div>
                <div className="p-4 font-mono text-sm text-green-400">
                  <pre className="whitespace-pre-wrap">
{`def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

# Example usage
sorted_array = [1, 3, 5, 7, 9, 11, 13]
result = binary_search(sorted_array, 7)
print(f"Found at index: {result}")
`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AlgoArena?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-primary mb-4">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Competitive Programming</h3>
                <p className="text-slate-600">Participate in timed coding contests with real-time leaderboards to test your skills against peers.</p>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-primary mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Learning Environment</h3>
                <p className="text-slate-600">Access curated problem sets organized by difficulty and topics to enhance your algorithmic thinking.</p>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-primary mb-4">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Integrated Code Editor</h3>
                <p className="text-slate-600">Write, test, and submit your solutions in our feature-rich code editor with syntax highlighting.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming contests section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Upcoming Contests</h2>
            <Link href="/contests">
              <div className="text-primary hover:text-indigo-700 font-medium flex items-center">
                View All <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingContests.length > 0 ? (
              upcomingContests.map((contest, index) => (
                <Card key={contest.id} className="bg-white shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                  <div className={`p-1 ${
                    index === 0 
                      ? 'bg-green-100 text-green-800' 
                      : index === 1 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  } text-center text-sm font-medium`}>
                    {index === 0 ? 'Live Now' : index === 1 ? 'Registration Open' : 'Coming Soon'}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{contest.title}</h3>
                    <p className="text-slate-600 mb-4">{contest.description}</p>
                    
                    <div className="flex items-center text-slate-500 mb-4">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / 3600000)} hours</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 flex items-center">
                        <Users className="h-3 w-3 mr-1" /> 128 participants
                      </span>
                      <Link href={`/contests/${contest.id}`}>
                        <Button variant={index === 2 ? "secondary" : "default"} disabled={index === 2} size="sm">
                          {index === 0 ? 'Join Now' : index === 1 ? 'Register' : 'Coming Soon'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Display placeholder cards if no contests are available
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="bg-white shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                  <div className={`p-1 ${
                    index === 0 
                      ? 'bg-green-100 text-green-800' 
                      : index === 1 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  } text-center text-sm font-medium`}>
                    {index === 0 ? 'Live Now' : index === 1 ? 'Registration Open' : 'Coming Soon'}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {index === 0 ? 'Weekly Code Sprint' : index === 1 ? 'Data Structures Challenge' : 'Algorithm Mastery'}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {index === 0 
                        ? 'Fast-paced coding challenges across various difficulty levels.' 
                        : index === 1 
                        ? 'Test your knowledge of arrays, linked lists, trees, and graphs.' 
                        : 'Solve challenging problems using dynamic programming and greedy algorithms.'}
                    </p>
                    
                    <div className="flex items-center text-slate-500 mb-4">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(Date.now() + (index + 1) * 86400000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{index === 0 ? '1.5' : index === 1 ? '2' : '3'} hours</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {index === 0 ? '42' : index === 1 ? '128' : '64'} participants
                      </span>
                      <Link href={user ? "/contests" : "/auth"}>
                        <Button variant={index === 2 ? "secondary" : "default"} disabled={index === 2} size="sm">
                          {index === 0 ? 'Join Now' : index === 1 ? 'Register' : 'Coming Soon'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="bg-slate-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                    JS
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Jane Smith</h4>
                    <p className="text-sm text-slate-500">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-slate-600">"AlgoArena helped me prepare for technical interviews at major tech companies. The competitive environment pushed me to optimize my solutions."</p>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="bg-slate-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                    MR
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Mark Rodriguez</h4>
                    <p className="text-sm text-slate-500">Software Engineer</p>
                  </div>
                </div>
                <p className="text-slate-600">"The platform offers a perfect balance of challenging problems and educational resources. I've seen significant improvement in my problem-solving skills."</p>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="bg-slate-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-primary font-bold">
                    AT
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Alice Thompson</h4>
                    <p className="text-sm text-slate-500">Coding Instructor</p>
                  </div>
                </div>
                <p className="text-slate-600">"I use AlgoArena with my students to make learning algorithms fun and engaging. The contest format keeps them motivated and competitive in a healthy way."</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Challenge Yourself?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">Join thousands of programmers improving their skills through competitions and problem-solving.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={user ? "/dashboard/student" : "/auth"}>
              <Button size="lg" className="bg-white text-primary hover:bg-indigo-50 w-full sm:w-auto">Sign Up Free</Button>
            </Link>
            <Link href="/contests">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">Browse Contests</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
