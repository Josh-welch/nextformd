import React from 'react';
import { FormBuilder } from './components/FormBuilder';
import { FormView } from './components/FormView';
import { Auth } from './components/Auth';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();
  const formSlug = window.location.pathname.match(/^\/forms\/([^/]+)/)?.[1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Common header for all pages
  const Header = () => (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Form Builder</h1>
        <p className="text-gray-600">Create multi-page forms with intelligent validation</p>
      </div>
      <Auth />
    </header>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Show header only on main page */}
        {!formSlug && <Header />}
        
        {formSlug ? (
          <FormView slug={formSlug} />
        ) : user ? (
          <FormBuilder />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to AI Form Builder</h2>
            <p className="text-gray-600 mb-6">Sign in to start creating intelligent forms</p>
            <Auth />
          </div>
        )}
      </div>
    </div>
  );
}