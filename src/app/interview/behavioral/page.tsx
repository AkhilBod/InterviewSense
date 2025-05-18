'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BehavioralQuestionSet from '../../interview/components/behavioral-question-set';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BehavioralInterviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Behavioral Interview Questions</h1>
        <p className="text-zinc-400 mb-8">
          Answer these behavioral interview questions to practice your responses. You'll see 5 questions at a time, 
          with the option to complete the interview or continue to the next set of questions. Your answers will be saved automatically.
        </p>
        
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardContent className="p-6">
            <BehavioralQuestionSet />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
