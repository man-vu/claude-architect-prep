import { AnimatedNumber } from "./AnimatedNumber";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-smooth rounded-md border border-line bg-card p-5 text-center">
      <div className="font-mono text-3xl font-bold text-ink"><AnimatedNumber value={value} /></div>
      <div className="mt-1 font-mono text-[11px] font-medium uppercase tracking-widest text-ink-soft">{label}</div>
    </div>
  );
}
