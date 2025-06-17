'use client';

import React, { useState } from 'react';
import ResumeAnalysisLoadingModal from '@/components/ResumeAnalysisLoadingModal';
import { Button } from '@/components/ui/button';

export default function DemoModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Resume Analysis Modal Demo
        </h1>
        <p className="text-slate-400 mb-8">
          Click the button below to see the comprehensive resume analysis loading modal in action.
        </p>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
        >
          Start Resume Analysis
        </Button>

        <div className="mt-8 text-sm text-slate-500">
          <p>The modal features:</p>
          <ul className="mt-2 space-y-1">
            <li>• 6 realistic analysis steps with individual progress tracking</li>
            <li>• Smooth animations and gradient progress bars</li>
            <li>• Educational tips for each step</li>
            <li>• Professional dark theme design</li>
            <li>• Auto-close after completion</li>
          </ul>
        </div>
      </div>

      <ResumeAnalysisLoadingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
