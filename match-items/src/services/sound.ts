let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function generateWavDataUri(frequency: number, durationMs: number): string {
  const sampleRate = 44100;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const fileSize = 44 + dataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const amplitude = 0.3;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const angle = 2 * Math.PI * frequency * t;
    const sample = Math.sin(angle) * amplitude;
    const val = Math.max(-1, Math.min(1, sample));
    const intVal = val < 0 ? val * 0x8000 : val * 0x7FFF;
    view.setInt16(44 + i * 2, intVal, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

let player: import('expo-audio').AudioPlayer | null = null;
let player2: import('expo-audio').AudioPlayer | null = null;

async function ensurePlayer() {
  if (player) return player;
  const { createAudioPlayer } = await import('expo-audio');
  const uri = generateWavDataUri(440, 50);
  player = createAudioPlayer(uri);
  return player;
}

async function ensurePlayer2() {
  if (player2) return player2;
  const { createAudioPlayer } = await import('expo-audio');
  const uri = generateWavDataUri(440, 50);
  player2 = createAudioPlayer(uri);
  return player2;
}

function play(frequency: number, duration: number) {
  if (!enabled) return;
  const uri = generateWavDataUri(frequency, duration);
  ensurePlayer().then((p) => {
    try {
      p.replace(uri);
      p.play();
    } catch {}
  });
}

function playDual(freq1: number, dur1: number, freq2: number, dur2: number) {
  if (!enabled) return;
  const uri1 = generateWavDataUri(freq1, dur1);
  const uri2 = generateWavDataUri(freq2, dur2);
  Promise.all([ensurePlayer(), ensurePlayer2()]).then(([p1, p2]) => {
    try {
      p1.replace(uri1);
      p1.play();
      setTimeout(() => {
        p2.replace(uri2);
        p2.play();
      }, Math.max(0, dur1 - dur2));
    } catch {}
  });
}

function playTriple(freq1: number, dur1: number, freq2: number, dur2: number, freq3: number, dur3: number) {
  if (!enabled) return;
  const uri1 = generateWavDataUri(freq1, dur1);
  const uri2 = generateWavDataUri(freq2, dur2);
  const uri3 = generateWavDataUri(freq3, dur3);
  Promise.all([ensurePlayer(), ensurePlayer2()]).then(([p1, p2]) => {
    try {
      p1.replace(uri1);
      p1.play();
      setTimeout(() => {
        p2.replace(uri2);
        p2.play();
      }, dur1);
      setTimeout(() => {
        p1.replace(uri3);
        p1.play();
      }, dur1 + dur2);
    } catch {}
  });
}

export function playMerge() {
  play(520, 80);
}

export function playCombo() {
  playDual(660, 100, 880, 120);
}

export function playSpawn() {
  play(440, 60);
}

export function playSell() {
  play(220, 100);
}

export function playCoin() {
  play(880, 60);
}

export function playGameOver() {
  playDual(330, 200, 260, 300);
}

export function playAchievement() {
  playTriple(523, 100, 659, 100, 784, 150);
}

export function playDailyReward() {
  playDual(660, 120, 880, 180);
}
