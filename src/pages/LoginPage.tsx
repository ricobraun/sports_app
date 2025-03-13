import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target as Cricket } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAppStore } from '../store';
import { signIn, signUp } from '../lib/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, setCurrentUser } = useAppStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      if (isSignUp) {
        await signUp(email, password, name);
        setError('Please check your email to confirm your account');
      } else {
        const { user } = await signIn(email, password);
        if (user) {
          setCurrentUser(user);
          navigate('/');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Cricket className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            CrickPredict
          </h2>
          <div className="mt-2 text-sm text-gray-600">
            <p>{isSignUp ? 'Create an account' : 'Sign in'} to join or create prediction pools</p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {isSignUp && (
              <Input
                label="Your Name"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            )}
            
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;