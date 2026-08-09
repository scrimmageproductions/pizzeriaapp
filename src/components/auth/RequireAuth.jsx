import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "../../context/AuthContext";

/** Layout-route guard: unauthenticated visitors bounce to /login before ever reaching /admin/*. */
export default function RequireAuth() {
  const { isAuthenticated } = useAuthState();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
