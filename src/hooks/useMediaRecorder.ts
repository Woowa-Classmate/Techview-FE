import { useRef, useState, useCallback } from "react";

interface UseMediaRecorderOptions {
  onDataAvailable?: (blob: Blob) => void;
  onStop?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

/**
 * 미디어 레코더를 관리하는 hook
 */
export const useMediaRecorder = (options: UseMediaRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          options.onDataAvailable?.(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        options.onStop?.(blob);
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = () => {
        options.onError?.(new Error("MediaRecorder error"));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 타이머 시작
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      options.onError?.(error as Error);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && !isRecording) {
      mediaRecorderRef.current.resume();
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setIsRecording(true);
    }
  }, [isRecording]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};

