"use client";
import { useEffect, useRef, useState } from "react";
import { AUDIO, audioUrl } from "@/content/audio";
import { claimAudio, releaseAudio } from "./audioBus";

function fmt(secs: number): string {
  const s = Math.max(0, Math.round(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Per-section narration playlist for a study page; auto-advances between
 *  sections so a whole page can be listened to hands-free. */
export function StudyAudio({ slug }: { slug: string }) {
  const sections = Object.entries(AUDIO)
    .filter(([id]) => id.startsWith(`s-${slug}-`))
    .sort(([a], [b]) => a.localeCompare(b));
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { if (ref.current) releaseAudio(ref.current); }, []);

  if (sections.length === 0) return null;
  const total = sections.reduce((s, [, m]) => s + m.s, 0);

  const playIdx = (idx: number) => {
    if (idx >= sections.length) { setCurrentIdx(null); setPlaying(false); return; }
    if (ref.current) releaseAudio(ref.current);
    const el = new Audio(audioUrl(sections[idx][0])!);
    el.addEventListener("ended", () => playIdx(idx + 1)); // auto-advance
    el.addEventListener("pause", () => setPlaying(false));
    el.addEventListener("play", () => setPlaying(true));
    ref.current = el;
    setCurrentIdx(idx);
    claimAudio(el);
    void el.play();
  };

  const toggleCurrent = () => {
    const el = ref.current;
    if (!el) { playIdx(0); return; }
    if (el.paused) { claimAudio(el); void el.play(); } else el.pause();
  };

  return (
    <div className="theme-smooth mb-6 rounded-md border border-line bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button" onClick={toggleCurrent}
          className="rounded-md bg-ink px-4 py-2 font-mono text-xs font-semibold text-paper transition-colors hover:bg-accent"
        >
          {playing ? "❚❚ pause" : currentIdx === null ? `▸ listen to this page ${fmt(total)}` : "▸ resume"}
        </button>
        <button type="button" onClick={() => setOpen(!open)} className="font-mono text-xs text-ink-soft hover:text-accent">
          {open ? "hide sections" : `${sections.length} sections ▾`}
        </button>
      </div>
      {open && (
        <ol className="mt-3 space-y-1">
          {sections.map(([id, m], idx) => (
            <li key={id}>
              <button
                type="button" onClick={() => playIdx(idx)}
                className={`w-full rounded px-2 py-1 text-left font-mono text-xs transition-colors hover:text-accent ${idx === currentIdx ? "bg-accent-soft text-accent" : "text-ink-soft"}`}
              >
                {idx === currentIdx && playing ? "❚❚" : "▸"} {m.t ?? id} · {fmt(m.s)}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
