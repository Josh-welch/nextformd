import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { LogIn, LogOut, AlertCircle, Mail } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export function Auth() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowForm(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = (() => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
          case 'auth/invalid-email':
            return 'Please enter a valid email address.';
          case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            return 'Invalid email or password.';
          case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
          default:
            return 'Authentication failed. Please try again.';
        }
      })();
      setError(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <Mail className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-white text-gray-800 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign in with Email
        </button>
      ) : (
        <form onSubmit={handleAuth} className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          {error && (
            <div className="flex items-start space-x-2 p-2 bg-red-50 rounded-md text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}