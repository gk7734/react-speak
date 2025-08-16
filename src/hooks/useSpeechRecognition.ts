import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  interimTranscript: string;
}

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

function useSpeechRecognition({
                                continuous = true,
                                interimResults = true,
                                language = 'ko-KR'
                              }: SpeechRecognitionOptions = {}): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] =
    useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // recognition 초기화 - 옵션이 변경될 때마다 재생성
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setBrowserSupportsSpeechRecognition(true);

      const recognition: SpeechRecognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognitionRef.current = recognition;
    } else {
      setBrowserSupportsSpeechRecognition(false);
    }
  }, [continuous, interimResults, language]); // 의존성 배열 추가

  const handleResult = useCallback((event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let currentInterimTranscript = '';

    // 새로운 결과만 처리
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalTranscript += transcript;
      } else {
        currentInterimTranscript += transcript;
      }
    }

    // 상태 업데이트 최적화
    if (finalTranscript) {
      setTranscript(prev => prev + finalTranscript);
    }
    setInterimTranscript(currentInterimTranscript);
  }, []);

  const handleError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    setListening(false);
  }, []);

  const handleEnd = useCallback(() => {
    setListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !browserSupportsSpeechRecognition) {
      console.warn('Speech recognition not available');
      return;
    }

    // 이미 listening 중이면 중복 실행 방지
    if (listening) {
      console.warn('Speech recognition is already running');
      return;
    }

    try {
      const recognition = recognitionRef.current;

      // 이벤트 리스너 설정
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;

      recognition.start();
      setListening(true);
      setInterimTranscript('');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setListening(false);
    }
  }, [browserSupportsSpeechRecognition, listening, handleResult, handleError, handleEnd]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setListening(false);
      setInterimTranscript('');
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current && listening) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
      }

      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [listening]);

  return {
    transcript,
    interimTranscript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
}

export default useSpeechRecognition;
