import { Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/user/login" replace />;
}
