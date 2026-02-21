'use client';

import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

function BehavioralInterviewPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-white">Behavioral Interview Questions</h1>
          <p className="text-gray-400 mb-8">
            Answer these behavioral interview questions to practice your responses. You'll see 5 questions at a time,
            with the option to complete the interview or continue to the next set of questions. Your answers will be saved automatically.
          </p>

          <Card className="bg-[#0f1117] border border-gray-800">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-400">Behavioral questions feature is coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function BehavioralInterviewPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BehavioralInterviewPage />
    </Suspense>
  );
}
