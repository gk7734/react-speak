// Speech Recognition 관련 이벤트 타입들
export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// Hook 반환 타입
export interface SpeechRecognitionResult {
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  interimTranscript: string;
}

// Hook 옵션 타입
export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
