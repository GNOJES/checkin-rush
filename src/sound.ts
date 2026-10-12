let context: AudioContext | undefined;
export function sound(kind: 'tap' | 'notify' | 'success' | 'failure', muted: boolean) {
  if (muted) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const notes =
      kind === 'success'
        ? [523, 659, 784]
        : kind === 'failure'
          ? [330, 262, 196]
          : kind === 'notify'
            ? [660, 880]
            : [480];
    notes.forEach((freq, i) => {
      const o = context!.createOscillator(),
        g = context!.createGain(),
        t = context!.currentTime + i * 0.13;
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.045, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g);
      g.connect(context!.destination);
      o.start(t);
      o.stop(t + 0.16);
    });
  } catch {
    /* Audio is optional. */
  }
}
