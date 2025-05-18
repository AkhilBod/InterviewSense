import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { testMicrophone } from '@/lib/microphone';
import { MicrophonePermissionGuide } from './MicrophonePermissionGuide';

export function MicrophoneTest() {
  const [testing, setTesting] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  
  const handleTestMicrophone = async () => {
    setTesting(true);
    try {
      const result = await testMicrophone();
      
      if (result.success) {
        toast({
          title: "Microphone working",
          description: "Your microphone is properly set up and ready to use.",
          variant: "default"
        });
      } else {
        toast({
          title: "Microphone issue detected",
          description: result.message || "There was a problem with your microphone.",
          variant: "destructive"
        });
        
        // Show permission guide if it's a permission issue
        if (result.message?.includes("denied") || result.message?.includes("settings")) {
          setShowPermissionGuide(true);
        }
      }
    } catch (error) {
      console.error("Error testing microphone:", error);
      toast({
        title: "Microphone test error",
        description: "An unexpected error occurred while testing your microphone.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <>
      <MicrophonePermissionGuide 
        isOpen={showPermissionGuide}
        onClose={() => setShowPermissionGuide(false)}
      />
      <Button 
        variant="outline"
        size="sm"
        onClick={handleTestMicrophone}
        disabled={testing}
        className="flex items-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Test Microphone
          </>
        )}
      </Button>
    </>
  );
}
