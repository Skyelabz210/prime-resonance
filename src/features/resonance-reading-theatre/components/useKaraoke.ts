import { useEffect, useRef, useState } from "react";
import type { NarrationTrack } from "../types/resonanceTypes";

export interface KaraokeState {
  playing: boolean;
  currentSegmentIndex: number;
  highlightTargets: Set<string>;
  elapsedMs: number;
}

export function useKaraoke(track: NarrationTrack, autoPlay: boolean) {
  const [state, setState] = useState<KaraokeState>({
    playing: false,
    currentSegmentIndex: -1,
    highlightTargets: new Set(),
    elapsedMs: 0,
  });
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const totalMs = track.segments.length
    ? track.segments[track.segments.length - 1].endMs
    : 0;

  const cancelSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speechRef.current = null;
  };

  const speak = (fromMs: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cancelSpeech();
    // Build utterance for remaining text only.
    const remaining = track.segments
      .filter((s) => s.endMs > fromMs)
      .map((s) => s.text)
      .join(" ");
    if (!remaining) return;
    const u = new SpeechSynthesisUtterance(remaining);
    u.rate = 0.95;
    u.pitch = 1;
    speechRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const tick = () => {
    if (!startedAtRef.current) return;
    const now = performance.now();
    const elapsed = offsetRef.current + (now - startedAtRef.current);
    let idx = -1;
    let highlights = new Set<string>();
    for (let i = 0; i < track.segments.length; i++) {
      const s = track.segments[i];
      if (elapsed >= s.startMs && elapsed < s.endMs) {
        idx = i;
        highlights = new Set(s.highlightTargets);
        break;
      }
    }
    setState((prev) =>
      prev.currentSegmentIndex === idx && prev.elapsedMs === Math.floor(elapsed / 100) * 100
        ? prev
        : {
            playing: true,
            currentSegmentIndex: idx,
            highlightTargets: highlights,
            elapsedMs: elapsed,
          },
    );
    if (elapsed >= totalMs) {
      stop();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const play = () => {
    pausedRef.current = false;
    startedAtRef.current = performance.now();
    setState((p) => ({ ...p, playing: true }));
    speak(offsetRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    pausedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (startedAtRef.current) {
      offsetRef.current += performance.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    cancelSpeech();
    setState((p) => ({ ...p, playing: false }));
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startedAtRef.current = null;
    offsetRef.current = 0;
    cancelSpeech();
    setState({
      playing: false,
      currentSegmentIndex: -1,
      highlightTargets: new Set(),
      elapsedMs: 0,
    });
  };

  const replay = () => {
    stop();
    setTimeout(play, 50);
  };

  useEffect(() => {
    if (autoPlay) play();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  return { state, play, pause, stop, replay, totalMs };
}
