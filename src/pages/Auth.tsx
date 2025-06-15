
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('divyadrishti_auth');
    if (isAuthenticated === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate authentication (replace with real auth logic)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes - in real app, validate against backend
      if (isLogin) {
        // Demo login - accept any valid email/password
        localStorage.setItem('divyadrishti_auth', 'true');
        localStorage.setItem('divyadrishti_user', JSON.stringify({
          email,
          role: 'analyst',
          loginTime: new Date().toISOString()
        }));
        
        toast({
          title: "Login Successful",
          description: "Welcome to Divyadrishti!",
        });
        navigate('/');
      } else {
        // Demo signup
        localStorage.setItem('divyadrishti_auth', 'true');
        localStorage.setItem('divyadrishti_user', JSON.stringify({
          email,
          role: 'analyst',
          loginTime: new Date().toISOString()
        }));
        
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Divyadrishti</h1>
          </div>
          <p className="text-slate-300">Secure Identity Intelligence Platform</p>
          <Badge variant="outline" className="mt-2">
            Government Authorized
          </Badge>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Secure Login' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@gov.in"
                  className="bg-slate-700/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter secure password"
                    className="bg-slate-700/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="bg-slate-700/50"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : isLogin ? (
                  <LogIn className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                className="text-purple-400 hover:text-purple-300"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-400">
          <p>Secured with end-to-end encryption</p>
          <p>All access is logged and monitored</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
