"use client";
import { useEffect, useRef, useState } from "react";
import { AUDIO, audioUrl } from "@/content/audio";
import { claimAudio, releaseAudio } from "./audioBus";

function fmt(secs: number): string {
  const s = Math.max(0, Math.round(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "▸ listen" narration control; renders nothing when the clip doesn't exist. */
export function AudioButton({ id, label = "listen" }: { id: string; label?: string }) {
  const meta = AUDIO[id];
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(0);

  useEffect(() => () => { if (ref.current) releaseAudio(ref.current); }, [id]);

  if (!meta) return null;

  const toggle = () => {
    if (!ref.current) {
      const el = new Audio(audioUrl(id)!);
      el.preload = "none";
      el.addEventListener("timeupdate", () => setPos(el.currentTime));
      el.addEventListener("ended", () => { setPlaying(false); setLoading(false); setPos(0); });
      el.addEventListener("pause", () => setPlaying(false));
      // "play" fires the instant play() is requested (may still be buffering);
      // "playing" fires once audio is actually producing sound.
      el.addEventListener("play", () => setLoading(true));
      el.addEventListener("playing", () => { setLoading(false); setPlaying(true); });
      el.addEventListener("waiting", () => setLoading(true)); // mid-playback stall/rebuffer
      el.addEventListener("error", () => { setLoading(false); setPlaying(false); });
      ref.current = el;
    }
    const el = ref.current;
    if (el.paused) { claimAudio(el); void el.play(); } else el.pause();
  };

  const label_ = loading ? "loading…" : playing ? `❚❚ ${fmt(pos)}` : `▸ ${label} ${fmt(meta.s)}`;

  return (
    <button
      type="button" onClick={toggle} disabled={loading}
      aria-label={loading ? `Loading ${label}` : playing ? `Pause ${label}` : `Play ${label}, ${fmt(meta.s)}`}
      className="shrink-0 rounded-md border border-line bg-card px-2.5 py-1 font-mono text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:cursor-wait"
    >
      {loading && <span className="spin mr-1 inline-block text-accent">◐</span>}
      {label_}
    </button>
  );
}
