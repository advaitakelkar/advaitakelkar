/**
 * The click-wheel tick: a 5ms band-passed noise burst, like an iPod wheel.
 *
 * Shared by the SideNav scroll wheel and the docked Pages list, so the two
 * wheels on the site sound the same. The AudioContext is created lazily and
 * only resumes after a user gesture — browsers keep it suspended until then,
 * and a suspended context just stays silent.
 */
let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function playTick() {
  initAudio();
  if (!audioCtx || audioCtx.state === 'suspended') return;

  const duration = 0.005; // 5ms burst
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800; // crisp high pitch
  filter.Q.value = 4.0;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration - 0.001);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start();
  noise.stop(audioCtx.currentTime + duration);
}
