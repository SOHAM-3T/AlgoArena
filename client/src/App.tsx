import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ContestsPage from "@/pages/contests-page";
import ContestDetailPage from "@/pages/contest-detail";
import ProblemPage from "@/pages/problem-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard/student" component={StudentDashboard} />
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      <ProtectedRoute path="/contests" component={ContestsPage} />
      <ProtectedRoute path="/contests/:id" component={ContestDetailPage} />
      <ProtectedRoute path="/contests/:contestId/problems/:problemId" component={ProblemPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
