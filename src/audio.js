const Audio = (() => {
  let actx = null;

  function getCtx() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function playTone({ type = 'sine', freq = 440, freq2, duration = 0.3,
                      volume = 0.4, delay = 0, fadeIn = 0.01, fadeOut = 0.1 }) {
    const ctx = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    if (freq2) osc.frequency.linearRampToValueAtTime(freq2, ctx.currentTime + delay + duration);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + fadeIn);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay + duration - fadeOut);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  }

  function noise(duration = 0.15, volume = 0.3) {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  let ambienceStarted = false;

  return {

    ambience() {
      if (ambienceStarted) return;
      ambienceStarted = true;
      const ctx = getCtx();
      const osc     = ctx.createOscillator();
      const gain    = ctx.createGain();
      const lfo     = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2;
      lfoGain.gain.value  = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      lfo.start();
    },

    footstep()      { noise(0.07, 0.1); },

    ghostNearby()   {
      playTone({ type: 'sine', freq: 120, freq2: 80,
                 duration: 0.6, volume: 0.2, fadeOut: 0.4 });
    },

    playerHit() {
      playTone({ type: 'sawtooth', freq: 220, freq2: 60,
                 duration: 0.4, volume: 0.45, fadeOut: 0.3 });
      noise(0.3, 0.35);
    },

    saltThrow() {
      playTone({ type: 'sine', freq: 800, freq2: 400,
                 duration: 0.25, volume: 0.3, fadeOut: 0.15 });
      noise(0.1, 0.18);
    },

    trapSet() {
      playTone({ type: 'square', freq: 300, duration: 0.1, volume: 0.22 });
      playTone({ type: 'square', freq: 450, duration: 0.1, volume: 0.22, delay: 0.1 });
    },

    holyWater() {
      playTone({ type: 'sine', freq: 600, freq2: 1200,
                 duration: 0.5, volume: 0.38, fadeOut: 0.3 });
      playTone({ type: 'sine', freq: 900, freq2: 1800,
                 duration: 0.4, volume: 0.18, delay: 0.1 });
      noise(0.4, 0.22);
    },

    flashlight() {
      noise(0.05, 0.45);
      playTone({ type: 'square', freq: 1200, freq2: 800,
                 duration: 0.08, volume: 0.18 });
    },

    pickup() {
      playTone({ type: 'sine', freq: 523, duration: 0.12, volume: 0.32 });
      playTone({ type: 'sine', freq: 659, duration: 0.12, volume: 0.32, delay: 0.1 });
      playTone({ type: 'sine', freq: 784, duration: 0.2,  volume: 0.32, delay: 0.2 });
    },

    ghostRepelled() {
      playTone({ type: 'sine', freq: 400, freq2: 200,
                 duration: 0.8, volume: 0.28, fadeOut: 0.5 });
      playTone({ type: 'sine', freq: 350, freq2: 150,
                 duration: 0.9, volume: 0.14, delay: 0.1 });
    },

    ghostFrozen() {
      playTone({ type: 'sine', freq: 200, freq2: 800,
                 duration: 0.3, volume: 0.28, fadeIn: 0.05 });
      playTone({ type: 'sine', freq: 250, freq2: 900,
                 duration: 0.3, volume: 0.18, delay: 0.05 });
    },

    win() {
      [523, 659, 784, 1047].forEach((f, i) => {
        playTone({ type: 'sine', freq: f, duration: 0.3, volume: 0.38, delay: i * 0.18 });
      });
    },

    gameOver() {
      [300, 250, 200, 150].forEach((f, i) => {
        playTone({ type: 'sawtooth', freq: f, duration: 0.5,
                   volume: 0.38, delay: i * 0.3, fadeOut: 0.4 });
      });
    },

  };
})();