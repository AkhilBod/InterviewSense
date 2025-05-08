// app/verify-request/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyRequestPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('email');
  
  // Pre-fill email if provided in URL
  useState(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  });
  
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-600">
            We sent you a verification link. Please check your email and click on the link to verify your account.
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {message && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{message}</p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-medium text-gray-900">Didn't receive an email?</h2>
              <p className="mt-1 text-sm text-gray-600">
                If you don't see it in your inbox, check your spam folder.
              </p>
            </div>
            
            <form onSubmit={handleResendVerification} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
                >
                  {isSubmitting ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-6">
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}