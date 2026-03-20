const Audio = (() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  function resume() { if (ctx.state === 'suspended') ctx.resume(); }

  // --- Low-level tone builder ---
  function playTone({ type = 'sine', freq = 440, freq2, duration = 0.3,
                       volume = 0.4, delay = 0, fadeIn = 0.01, fadeOut = 0.1 }) {
    resume();
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
    osc.stop(ctx.currentTime + delay + duration + 0.01);
  }

  function noise(duration = 0.15, volume = 0.3) {
    resume();
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

  // --- Sound effects ---
  return {
    // Creepy ambient hum (call once on game start)
    ambience() {
      resume();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2;
      lfoGain.gain.value  = 0.04;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      lfo.start();
      // never stops — that's the haunted house atmosphere
    },

    // Footstep — call when player moves
    footstep() {
      noise(0.08, 0.12);
    },

    // Ghost nearby warning — low eerie pulse
    ghostNearby() {
      playTone({ type: 'sine', freq: 120, freq2: 80, duration: 0.6, volume: 0.25, fadeOut: 0.4 });
    },

    // Ghost catches you — harsh hit
    playerHit() {
      playTone({ type: 'sawtooth', freq: 220, freq2: 60, duration: 0.4, volume: 0.5, fadeOut: 0.3 });
      noise(0.3, 0.4);
    },

    // Salt throw / item use
    saltThrow() {
      playTone({ type: 'sine', freq: 800, freq2: 400, duration: 0.25, volume: 0.3, fadeOut: 0.15 });
      noise(0.1, 0.2);
    },

    // Trap placed
    trapSet() {
      playTone({ type: 'square', freq: 300, duration: 0.1, volume: 0.25 });
      playTone({ type: 'square', freq: 450, duration: 0.1, volume: 0.25, delay: 0.1 });
    },

    // Holy water burst — big magical whoosh
    holyWater() {
      playTone({ type: 'sine', freq: 600, freq2: 1200, duration: 0.5, volume: 0.4, fadeOut: 0.3 });
      playTone({ type: 'sine', freq: 900, freq2: 1800, duration: 0.4, volume: 0.2, delay: 0.1 });
      noise(0.4, 0.25);
    },

    // Flashlight click
    flashlight() {
      noise(0.05, 0.5);
      playTone({ type: 'square', freq: 1200, freq2: 800, duration: 0.08, volume: 0.2 });
    },

    // Item pickup — bright chime
    pickup() {
      playTone({ type: 'sine', freq: 523, duration: 0.12, volume: 0.35 });
      playTone({ type: 'sine', freq: 659, duration: 0.12, volume: 0.35, delay: 0.1 });
      playTone({ type: 'sine', freq: 784, duration: 0.2,  volume: 0.35, delay: 0.2 });
    },

    // Ghost repelled — ghostly wail retreating
    ghostRepelled() {
      playTone({ type: 'sine',  freq: 400, freq2: 200, duration: 0.8, volume: 0.3, fadeOut: 0.5 });
      playTone({ type: 'sine',  freq: 350, freq2: 150, duration: 0.9, volume: 0.15, delay: 0.1 });
    },

    // Ghost frozen
    ghostFrozen() {
      playTone({ type: 'sine', freq: 200, freq2: 800, duration: 0.3, volume: 0.3, fadeIn: 0.05 });
      playTone({ type: 'sine', freq: 250, freq2: 900, duration: 0.3, volume: 0.2, delay: 0.05 });
    },

    // You escaped! — triumphant
    win() {
      [523, 659, 784, 1047].forEach((f, i) => {
        playTone({ type: 'sine', freq: f, duration: 0.3, volume: 0.4, delay: i * 0.18 });
      });
    },

    // Game over — descending doom
    gameOver() {
      [300, 250, 200, 150].forEach((f, i) => {
        playTone({ type: 'sawtooth', freq: f, duration: 0.5, volume: 0.4, delay: i * 0.3, fadeOut: 0.4 });
      });
    },
  };
})();