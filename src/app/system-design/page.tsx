"use client"

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Code2,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function SystemDesignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    experienceLevel: '',
    testDifficulty: '',
    targetCompany: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!formData.experienceLevel || !formData.testDifficulty) {
      setError("Please provide your experience level and test difficulty.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/system-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate system design test');
      }

      // Store the result and navigate to results page
      sessionStorage.setItem('systemDesignTest', JSON.stringify(result.data));
      router.push('/system-design/results');
    } catch (error) {
      console.error('System design generation error:', error);
      setError("Failed to generate system design test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1e]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="px-4 h-full overflow-y-auto">
          {/* System Design Test - Centered */}
          <div className="flex items-center justify-center min-h-screen py-8">
            <div className="w-full max-w-2xl">
              {/* Header Section */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                  System Design Interview Test
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Demonstrate your system design skills with real-world scenarios
                </p>
              </div>

              <Card className="bg-[#111827] border border-gray-800">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Experience Level */}
                    <div className="space-y-3 group">
                      <label className="text-blue-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Your Experience Level
                      </label>
                      <div className="relative">
                        <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 h-12 transition-all duration-300 ">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                            <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                            <SelectItem value="senior">Senior (5+ years)</SelectItem>
                            <SelectItem value="lead">Tech Lead/Principal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Test Difficulty */}
                    <div className="space-y-3 group">
                      <label className="text-blue-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Test Difficulty
                      </label>
                      <div className="relative">
                        <Select value={formData.testDifficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, testDifficulty: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 h-12 transition-all duration-300 ">
                            <SelectValue placeholder="Choose test difficulty" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="easy">Easy (Basic concepts)</SelectItem>
                            <SelectItem value="medium">Medium (Real-world scenarios)</SelectItem>
                            <SelectItem value="hard">Hard (Complex systems)</SelectItem>
                            <SelectItem value="interview">Interview Style (Mixed difficulty)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Target Company Type */}
                    <div className="space-y-3 group">
                      <label className="text-blue-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Target Company Type (Optional)
                      </label>
                      <div className="relative">
                        <Select value={formData.targetCompany} onValueChange={(value) => setFormData(prev => ({ ...prev, targetCompany: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 h-12 transition-all duration-300 ">
                            <SelectValue placeholder="What type of company are you targeting?" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="faang">FAANG/Big Tech</SelectItem>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="fintech">Fintech</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-lg bg-blue-900/30 border border-blue-800 text-blue-200 p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <div className="text-sm">{error}</div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-base sm:text-lg font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none border-0"
                        disabled={isLoading || !formData.experienceLevel || !formData.testDifficulty}
                      >
                        <Code2 className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        <span>{isLoading ? "Preparing Test..." : "Start System Design Test"}</span>
                      </Button>

                      {(!formData.experienceLevel || !formData.testDifficulty) && (
                        <p className="text-center text-zinc-400 text-sm mt-3">
                          Please select your experience level and test difficulty to begin
                        </p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 