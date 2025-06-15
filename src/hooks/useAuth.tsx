
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  role: string;
  loginTime: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem('divyadrishti_auth');
        const userData = localStorage.getItem('divyadrishti_user');
        
        if (authStatus === 'true' && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('divyadrishti_auth');
    localStorage.removeItem('divyadrishti_user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/auth');
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout,
    requireAuth,
  };
};
