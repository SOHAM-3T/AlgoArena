import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { insertUserSchema } from '@shared/schema';

// Extended schemas with validations
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['student', 'admin']).default('student'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Define forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      fullName: '',
      role: 'student',
      terms: false,
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student');
    }
  }, [user, navigate]);

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword and terms, they're only for form validation
    const { confirmPassword, terms, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image and info */}
      <div className="hidden lg:block lg:w-1/2 bg-primary">
        <div className="flex h-full items-center justify-center px-12">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-white mb-6">Welcome to AlgoArena</h1>
            <p className="text-xl text-indigo-100 mb-8">Join our competitive programming platform to enhance your coding skills, participate in contests, and track your progress.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-bold text-white text-2xl mb-1">150+</div>
                <div className="text-indigo-100">Coding Challenges</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-bold text-white text-2xl mb-1">5,000+</div>
                <div className="text-indigo-100">Active Users</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-bold text-white text-2xl mb-1">25+</div>
                <div className="text-indigo-100">Weekly Contests</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-bold text-white text-2xl mb-1">3+</div>
                <div className="text-indigo-100">Programming Languages</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Log in to your account</h2>
                <p className="text-slate-600">Enter your credentials to access your account</p>
              </div>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="johndoe" 
                            className="w-full px-4 py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-1">
                          <FormLabel>Password</FormLabel>
                          <a href="#/forgot-password" className="text-sm text-primary hover:text-indigo-700">
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full px-4 py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Logging in...' : 'Log in'}
                  </Button>
                  
                  <div className="relative flex items-center justify-center mt-6">
                    <div className="border-t border-slate-300 absolute w-full"></div>
                    <div className="bg-white px-4 text-sm text-slate-500 relative">or continue with</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant="outline" className="py-2.5 px-4 border border-slate-300 rounded-lg flex justify-center items-center text-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg> Google
                    </Button>
                    <Button type="button" variant="outline" className="py-2.5 px-4 border border-slate-300 rounded-lg flex justify-center items-center text-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="#333"/>
                      </svg> GitHub
                    </Button>
                  </div>
                  
                  <div className="text-center mt-8">
                    <p className="text-slate-600">
                      Don't have an account? 
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-primary hover:text-indigo-700 font-medium"
                        onClick={() => setActiveTab('register')}
                      >
                        Sign up
                      </Button>
                    </p>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Create your account</h2>
                <p className="text-slate-600">Join AlgoArena to start coding and competing</p>
              </div>
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John Doe" 
                            className="w-full px-4 py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="john.doe@example.com" 
                            className="w-full px-4 py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="johndoe" 
                            className="w-full px-4 py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="••••••••" 
                              className="w-full px-4 py-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="••••••••" 
                              className="w-full px-4 py-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="student"
                              checked={field.value === 'student'}
                              onChange={() => field.onChange('student')}
                              className="mr-2"
                            />
                            <Label htmlFor="student">Student</Label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="admin"
                              checked={field.value === 'admin'}
                              onChange={() => field.onChange('admin')}
                              className="mr-2"
                            />
                            <Label htmlFor="admin">Faculty/Admin</Label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I agree to the <a href="#/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="#/privacy" className="text-primary hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 mt-4"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                  </Button>
                  
                  <div className="text-center mt-6">
                    <p className="text-slate-600">
                      Already have an account? 
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-primary hover:text-indigo-700 font-medium"
                        onClick={() => setActiveTab('login')}
                      >
                        Log in
                      </Button>
                    </p>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
