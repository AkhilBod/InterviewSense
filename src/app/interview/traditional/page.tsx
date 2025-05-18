'use client';

// Redirect to the main interview implementation
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function TraditionalInterviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the original interview page implementation
    router.replace('/interview');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-zinc-400">Loading interview...</p>
      </div>
    </div>
  );
}

export default function TraditionalInterviewRedirectWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <TraditionalInterviewRedirect />
    </Suspense>
  );
}
