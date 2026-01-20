import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/todos" replace />;
  }

  return <>{children}</>;
};
