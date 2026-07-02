// One narration at a time, app-wide: starting any clip stops the previous one.
let active: HTMLAudioElement | null = null;

export function claimAudio(el: HTMLAudioElement) {
  if (active && active !== el) active.pause();
  active = el;
}

export function releaseAudio(el: HTMLAudioElement) {
  el.pause();
  if (active === el) active = null;
}
