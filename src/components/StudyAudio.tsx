"use client";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AUDIO, audioUrl } from "@/content/audio";
import { claimAudio, releaseAudio } from "./audioBus";
import { useT } from "@/i18n/LocaleProvider";

function fmt(secs: number): string {
  const s = Math.max(0, Math.round(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const DRAWER_W = 300; // px — kept in sync with the inline width below
const TAB_W = 40; // px — kept in sync with the tab's w-10 class
// Closed offset must clear the drawer's full width PAST the tab, not just to the
// tab's edge — the tab (48px tall) only covers a fraction of the drawer's height
// (420px+), so anything less than DRAWER_W + TAB_W leaves a sliver of the drawer
// visible above/below the tab, uncovered by anything.
const CLOSED_OFFSET = DRAWER_W + TAB_W;

/** Edge-docked audio channel: a slim "LISTEN" tab always flush against the right
 *  edge (simple `right: 0`, never itself moved — avoids the fragile negative-offset
 *  math that can leave a gap depending on how a browser measures the viewport).
 *  Tap it, or drag it left, to open the drawer. Selecting a section scrolls the
 *  article to that heading and starts narrating it. Renders nothing when there's no
 *  narration for this slug — narration is English-only, so this hides on translations. */
export function StudyAudio({ slug }: { slug: string }) {
  const t = useT();
  const sections = Object.entries(AUDIO)
    .filter(([id]) => id.startsWith(`s-${slug}-`))
    .sort(([a], [b]) => a.localeCompare(b));
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragX, setDragX] = useState<number | null>(null); // drawer's own live offset while dragging
  const dragStart = useRef<{ x: number; base: number } | null>(null);
  const moved = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { if (audioRef.current) releaseAudio(audioRef.current); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (sections.length === 0) return null;
  const total = sections.reduce((s, [, m]) => s + m.s, 0);

  const playIdx = (idx: number) => {
    if (idx >= sections.length) { setCurrentIdx(null); setPlaying(false); setLoading(false); return; }
    if (audioRef.current) releaseAudio(audioRef.current);
    const el = new Audio(audioUrl(sections[idx][0])!);
    el.addEventListener("ended", () => playIdx(idx + 1)); // auto-advance
    el.addEventListener("pause", () => setPlaying(false));
    // "play" fires the instant play() is requested (may still be buffering);
    // "playing" fires once audio is actually producing sound.
    el.addEventListener("play", () => setLoading(true));
    el.addEventListener("playing", () => { setLoading(false); setPlaying(true); });
    el.addEventListener("waiting", () => setLoading(true)); // mid-playback stall/rebuffer
    el.addEventListener("error", () => { setLoading(false); setPlaying(false); });
    audioRef.current = el;
    setCurrentIdx(idx);
    claimAudio(el);
    void el.play();
  };

  const toggleCurrent = () => {
    const el = audioRef.current;
    if (!el) { playIdx(0); return; }
    if (el.paused) { claimAudio(el); void el.play(); } else el.pause();
  };

  const goToSection = (idx: number) => {
    const [id] = sections[idx];
    if (idx === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    playIdx(idx);
    setOpen(false);
  };

  // Drag the tab to open/close; a tap (negligible movement) just toggles. Offset is
  // the DRAWER's own translateX in px: 0 = fully open, CLOSED_OFFSET = fully hidden.
  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, base: open ? 0 : CLOSED_OFFSET };
    moved.current = false;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 4) moved.current = true;
    setDragX(Math.max(0, Math.min(CLOSED_OFFSET, dragStart.current.base + dx)));
  };
  const onPointerUp = () => {
    if (!dragStart.current) return;
    if (!moved.current) setOpen((o) => !o);
    else if (dragX !== null) setOpen(dragX <= CLOSED_OFFSET / 2);
    dragStart.current = null;
    setDragX(null);
  };

  const drawerOffset = dragX !== null ? dragX : (open ? 0 : CLOSED_OFFSET);

  return (
    <>
      {open && (
        <button
          type="button" aria-label={t.audio.closePanel} onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40"
        />
      )}
      {/* Tab: always flush at the true right edge, never itself repositioned. */}
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? t.audio.closePanel : t.audio.openPanel}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        className="theme-smooth fixed top-1/2 right-0 z-[51] flex w-10 -translate-y-1/2 touch-none select-none items-center justify-center rounded-l-md border border-r-0 border-line bg-card py-6 font-mono text-[11px] font-bold tracking-widest text-ink transition-colors hover:bg-accent hover:text-paper rtl:right-auto rtl:left-0 rtl:rounded-l-none rtl:rounded-r-md rtl:border-l rtl:border-r-0"
        style={{ writingMode: "vertical-rl" }}
      >
        {t.audio.tab}
      </button>
      {/* Drawer: a separate fixed element, docked immediately left of the tab, sliding
          via its own transform (0 = open, DRAWER_W = fully hidden behind the tab). */}
      <div
        className="theme-smooth fixed top-1/2 z-50 max-h-[70vh] w-[300px] overflow-y-auto rounded-l-md border border-line bg-card p-3 shadow-lg"
        style={{
          right: TAB_W,
          transform: `translateY(-50%) translateX(${drawerOffset}px)`,
          transition: dragX === null ? "transform 220ms ease" : "none",
        }}
      >
        <button
          type="button" onClick={toggleCurrent} disabled={loading}
          className="w-full rounded-md bg-ink px-4 py-2 font-mono text-xs font-semibold text-paper transition-colors hover:bg-accent disabled:cursor-wait"
        >
          {loading
            ? <><span className="spin mr-1 inline-block">◐</span>{t.audio.loading}</>
            : playing ? t.audio.pause : currentIdx === null ? t.audio.listenToPage(fmt(total)) : t.audio.resume}
        </button>
        <ol className="mt-3 space-y-1">
          {sections.map(([id, m], idx) => (
            <li key={id}>
              <button
                type="button" onClick={() => goToSection(idx)}
                className={`w-full rounded px-2 py-1 text-left font-mono text-xs transition-colors hover:text-accent ${idx === currentIdx ? "bg-accent-soft text-accent" : "text-ink-soft"}`}
              >
                {idx === currentIdx && loading
                  ? <span className="spin mr-0.5 inline-block text-accent">◐</span>
                  : idx === currentIdx && playing ? "❚❚" : "▸"} {m.t ?? id} · {fmt(m.s)}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
