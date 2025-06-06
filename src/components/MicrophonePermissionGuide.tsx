import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaMicrophone } from "react-icons/fa";

interface MicrophonePermissionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MicrophonePermissionGuide({ isOpen, onClose }: MicrophonePermissionGuideProps) {
  // Detect browser to provide browser-specific instructions
  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
      return "Safari";
    } else if (userAgent.indexOf("Firefox") > -1) {
      return "Firefox";
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
      return "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
      return "Edge";
    } else {
      return "your browser";
    }
  };

  const browser = getBrowserName();

  const getBrowserInstructions = () => {
    switch (browser) {
      case "Chrome":
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the lock icon (or "Not secure") in the address bar</li>
            <li>Find "Microphone" in the permissions list</li>
            <li>Change the setting from "Block" to "Allow"</li>
            <li>Reload the page</li>
          </ol>
        );
      case "Firefox":
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the lock icon in the address bar</li>
            <li>Click on "Connection secure" or "Connection not secure"</li>
            <li>Click "More Information" and then "Permissions"</li>
            <li>Find "Use the Microphone" and change to "Allow"</li>
            <li>Reload the page</li>
          </ol>
        );
      case "Safari":
        return (
          <>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 text-yellow-700">
              <p className="font-bold">Safari Troubleshooting:</p>
              <p>Safari users may need to take additional steps for microphone access to work properly.</p>
            </div>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>When prompted</strong>, click "Allow" to grant microphone access</li>
              <li>If audio still doesn't work, <strong>click on "Safari" in the menu bar</strong> (top of screen)</li>
              <li>Select "Settings for This Website" in the dropdown</li>
              <li>Find "Microphone" in the list and change to "Allow"</li>
              <li>Next, go to <strong>System Preferences → Security & Privacy → Privacy → Microphone</strong></li>
              <li>Make sure Safari is checked in the list of apps allowed to use your microphone</li>
              <li>If changes were made, <strong>completely quit Safari</strong> (Command+Q) and restart it</li>
              <li>As a last resort, try using Chrome or Firefox which have better audio recording support</li>
            </ol>
          </>
        );
      case "Edge":
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the lock icon (or "Not secure") in the address bar</li>
            <li>Find "Microphone" in the site permissions</li>
            <li>Change from "Block" to "Allow"</li>
            <li>Reload the page</li>
          </ol>
        );
      default:
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Look for site permissions in your browser settings</li>
            <li>Find microphone permissions for this site</li>
            <li>Change the setting to allow microphone access</li>
            <li>Reload the page</li>
          </ol>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaMicrophone className="text-red-500" />
            Microphone Access Required
          </DialogTitle>
          <DialogDescription>
            InterviewSense needs microphone access to record your interview answers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">How to enable microphone access in {browser}:</h4>
            {getBrowserInstructions()}
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Common Issues:</h4>
            <ul className="list-disc pl-5 text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>Another application may be using your microphone</li>
              <li>Your microphone might be muted at the hardware level</li>
              <li>You may need to select the correct microphone if you have multiple devices</li>
              {browser === "Safari" && (
                <>
                  <li className="font-medium">Safari-specific: Make sure your Mac's Privacy settings allow microphone access</li>
                  <li className="font-medium">Go to System Preferences → Security & Privacy → Privacy → Microphone and ensure Safari is checked</li>
                  <li className="font-medium">You may need to completely restart Safari after changing permissions</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {browser === "Safari" && (
            <p className="text-amber-500 text-xs italic mb-2 w-full">
              Note: Safari has limited recording support. If problems persist after following all steps, 
              we recommend using Chrome or Firefox for the best interview experience.
            </p>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.location.reload()}>
            Reload Page & Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
