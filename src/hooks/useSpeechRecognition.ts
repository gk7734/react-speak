import { useEffect, useState } from 'react';

function useSpeechRecognition() {
  const [
    browserSupportsSpeechRecognition,
    setBrowserSupportsSpeechRecognition
  ] = useState<boolean>(true);

  useEffect(() => {
    if (
      !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      setBrowserSupportsSpeechRecognition(false);
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
  });
}

export default useSpeechRecognition;
