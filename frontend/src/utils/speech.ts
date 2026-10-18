/**
 * Native Text-to-Speech (TTS) utility using Web Speech API
 */
export const speakText = (text: string, lang = 'en-US', rate = 0.9, pitch = 1) => {
  if (!text || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};
