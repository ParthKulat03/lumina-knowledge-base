import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";

export function ProtectedRoutes() {
  const { user, refreshSession } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      await refreshSession();
      setChecking(false);
    })();
  }, [refreshSession]);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
