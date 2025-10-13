/**
 * Utility functions for handling microphone permissions and access
 */

/**
 * Checks if the user's browser has permission to access the microphone
 * @returns Promise with the permission status: 'granted', 'denied', 'prompt', or 'error'
 */
export async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'error'> {
  try {
    // Safari special handling - Safari doesn't reliably report permission status
    // and has unique behavior with permissions
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Check if browser supports permissions API
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return permissionStatus.state as 'granted' | 'denied' | 'prompt';
      } catch (err) {
        // Some browsers (like Safari) may throw an error when using permissions API
        console.log("Permissions API not fully supported, falling back to direct access test");
      }
    }
    
    // Fallback for browsers that don't support permissions API or when it fails
    // Try to access the microphone and see if it works
    try {
      // Try with minimal constraints to avoid Safari issues
      const constraints = { 
        audio: isSafari ? true : { 
          echoCancellation: true,
          noiseSuppression: true
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // If we get here, permission was granted
      // Clean up by stopping all tracks
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    } catch (error) {
      console.log("Error during getUserMedia fallback:", error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          return 'denied';
        }
      }
      return 'prompt'; // We're not sure, so assume the user will be prompted
    }
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return 'error';
  }
}

/**
 * Tests if the microphone is working and accessible
 * @returns Promise with a status and optional error message
 */
export async function testMicrophone(): Promise<{ success: boolean; message?: string }> {
  try {
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log("Browser detection - Safari:", isSafari);
    
    // First check permission status
    const permissionStatus = await checkMicrophonePermission();
    console.log("Microphone permission status:", permissionStatus);
    
    if (permissionStatus === 'denied') {
      return { 
        success: false, 
        message: "Microphone access has been denied. Please update your browser settings to allow microphone access." 
      };
    }
    
    if (permissionStatus === 'error') {
      return { 
        success: false, 
        message: "An error occurred while checking microphone permissions. Your browser may not support this feature." 
      };
    }
    
    // Special handling for Safari - use simpler constraints
    const constraints = { 
      audio: isSafari ? true : {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    
    console.log("Attempting getUserMedia with constraints:", constraints);
    
    // Try to access the microphone
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("Successfully got media stream");
    
    // Check if we have audio tracks
    if (stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach(track => track.stop());
      return {
        success: false,
        message: "No audio input devices were detected. Please check that your microphone is properly connected."
      };
    }
    
    // Check if microphone is muted (this is a best-effort check, not always reliable)
    const audioTrack = stream.getAudioTracks()[0];
    
    // In Safari, it might show muted incorrectly, so we handle it differently
    if (!isSafari && (audioTrack.muted || !audioTrack.enabled)) {
      stream.getTracks().forEach(track => track.stop());
      return {
        success: false,
        message: "Your microphone appears to be muted. Please check your microphone settings."
      };
    }
    
    // Clean up
    stream.getTracks().forEach(track => track.stop());
    
    return { success: true };
  } catch (error) {
    console.error('Error testing microphone:', error);
    
    let message = "Could not access your microphone.";
    
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          message = "Microphone access was denied. Please allow microphone access in your browser settings.";
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          message = "No microphone detected. Please connect a microphone and try again.";
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          message = "Your microphone is in use by another application. Please close other applications that might be using your microphone.";
          break;
        case 'SecurityError':
          message = "The use of your microphone is blocked by your browser's security settings.";
          break;
        case 'AbortError':
          // Safari sometimes throws AbortError even when permissions are granted
          if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            message = "Safari had trouble accessing your microphone. Please reload the page and try again.";
          } else {
            message = "The microphone operation was aborted. Please try again.";
          }
          break;
      }
    }
    
    return { success: false, message };
  }
}
