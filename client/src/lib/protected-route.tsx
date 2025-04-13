import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If the route is for admin only, check role
  const isAdminRoute = path.includes("admin");
  
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If the route is for admin but the user is not an admin
  if (isAdminRoute && user.role !== "admin") {
    return (
      <Route path={path}>
        <Redirect to="/dashboard/student" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
