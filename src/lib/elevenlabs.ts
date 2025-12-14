// ElevenLabs TTS Integration with Smart Model Selection
// Prioritizes premium models first, then turbo models to maximize subscription value

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  fine_tuning?: {
    is_allowed: boolean;
  };
}

// Removed UsageStats interface - now using real-time API data

interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface SpeechOptions {
  voice?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  
  // Always use turbo model for efficiency
  private readonly MODEL_ID = 'eleven_turbo_v2_5'; // Latest turbo model
  
  // Use Akhil - professional male voice for interviews
  private readonly VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Akhil - professional male voice
  
  // Interview-optimized voice settings
  private readonly INTERVIEW_VOICE_SETTINGS = {
    stability: 0.65,        // Higher stability for consistent, clear speech
    similarity_boost: 0.85, // High similarity for professional tone consistency
    style: 0.25,           // Low style variation for formal interview context
    use_speaker_boost: true // Enhanced clarity and volume for better audio quality
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Convert text to speech using ElevenLabs API with turbo model and elegant female voice
   * @param text - Text to convert to speech
   * @param options - Speech generation options (optional)
   * @returns Audio blob URL
   */
  async synthesizeSpeech(text: string, options?: SpeechOptions): Promise<{ audioUrl: string; creditsUsed: number }> {
    try {
      console.log('🎵 Using ElevenLabs Turbo with Ethan (professional male voice)');
      
      const requestBody: TTSRequest = {
        text: text.trim(),
        model_id: this.MODEL_ID,
        voice_settings: {
          // Use interview-optimized settings by default, allow overrides
          stability: options?.stability ?? this.INTERVIEW_VOICE_SETTINGS.stability,
          similarity_boost: options?.similarityBoost ?? this.INTERVIEW_VOICE_SETTINGS.similarity_boost,
          style: options?.style ?? this.INTERVIEW_VOICE_SETTINGS.style,
          use_speaker_boost: options?.useSpeakerBoost ?? this.INTERVIEW_VOICE_SETTINGS.use_speaker_boost
        }
      };

      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('ElevenLabs API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Text might be too long or contain unsupported characters.');
        }
        
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ ElevenLabs TTS successful with Ethan voice');
      
      return {
        audioUrl,
        creditsUsed: text.length // Simple credit estimation
      };
      
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async textToSpeech(text: string, options?: SpeechOptions): Promise<Blob> {
    const result = await this.synthesizeSpeech(text, options);
    const response = await fetch(result.audioUrl);
    return await response.blob();
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return [];
    }
  }

  /**
   * Simple readiness check for ElevenLabs service
   */
  async checkReadiness(): Promise<{ ready: boolean; message: string; testAudioUrl?: string }> {
    try {
      console.log('🔄 Testing ElevenLabs connection...');
      
      // Test API key validity by fetching voices
      const voicesResponse = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!voicesResponse.ok) {
        if (voicesResponse.status === 401) {
          return { ready: false, message: 'Invalid API key' };
        }
        return { ready: false, message: `API connection failed: ${voicesResponse.status}` };
      }
      
      console.log('✅ ElevenLabs is ready');
      return { 
        ready: true, 
        message: 'ElevenLabs service is ready'
      };
      
    } catch (error) {
      console.error('❌ ElevenLabs readiness check failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { ready: false, message: `Readiness check failed: ${errorMessage}` };
    }
  }

  /**
   * Get optimized voice settings for interview scenarios
   */
  getInterviewVoiceSettings(): {
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  } {
    return {
      stability: 0.6,        // Balanced stability for clear speech
      similarityBoost: 0.8,  // High similarity for consistency
      style: 0.3,           // Slight style variation for naturalness
      useSpeakerBoost: true  // Enhanced clarity for interviews
    };
  }
}

// Create singleton instance with API key from environment
const elevenLabsTTS = new ElevenLabsService(
  process.env.ELEVENLABS_API_KEY || 'sk_774ab0336a5feab3e749f7d290126226187c0bbbf0dc48e9'
);

/**
 * Utility function to play audio from URL
 */
export function playAudioFromUrl(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    audio.onloadeddata = () => {
      console.log('🎵 Audio loaded, duration:', audio.duration, 'seconds');
    };
    
    audio.onplay = () => {
      console.log('🔊 Audio playback started');
    };
    
    audio.onended = () => {
      console.log('✅ Audio playback completed');
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error('❌ Audio playback error:', error);
      reject(new Error('Failed to play audio'));
    };
    
    // Set volume and start playback
    audio.volume = 1.0;
    audio.play().catch(reject);
  });
}

/**
 * Utility function to play audio blob
 */
export function playAudioBlob(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onloadeddata = () => {
      console.log('🎵 Audio loaded, duration:', audio.duration, 'seconds');
    };
    
    audio.onplay = () => {
      console.log('🔊 Audio playback started');
    };
    
    audio.onended = () => {
      console.log('✅ Audio playback completed');
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error('❌ Audio playback error:', error);
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Failed to play audio'));
    };
    
    // Set volume and start playback
    audio.volume = 1.0;
    audio.play().catch(reject);
  });
}

// Popular voice IDs for easy reference
export const VOICE_IDS = {
  RACHEL: '21m00Tcm4TlvDq8ikWAM',     // Female, young, narrative
  DREW: '29vD33N1CtxCmqQRPOHJ',       // Male, middle-aged, news
  CLYDE: '2EiwWnXFnvU5JabPnv8n',      // Male, middle-aged, war veteran
  DAVE: 'CYw3kZ02Hs0563khs1Fj',       // Male, young, conversational
  FIN: 'D38z5RcWu1voky8WS1ja',        // Male, elderly, sailor
  FREYA: 'jsCqWAovK2LkecY7zXl4',      // Female, young, oversharer
  GRACE: 'oWAxZDx7w5VEj9dCyTzz',      // Female, young, southerner
  DANIEL: 'onwK4e9ZLuTAKqWW03F9'      // Male, deep, authoritative
} as const;

export default elevenLabsTTS;
export { ElevenLabsService };
export type { ElevenLabsVoice, SpeechOptions };
