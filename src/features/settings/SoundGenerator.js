export class SoundGenerator {
    constructor() {
      this.audioContext = null;
      this.initAudioContext();
    }
  
    initAudioContext() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  
    async ensureAudioContext() {
      if (!this.audioContext) {
        this.initAudioContext();
      }
      
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
  
    // Classic beep sound
    playClassicBeep(volume = 0.5, duration = 0.3) {
      return this.playTone(800, volume, duration, 'sine');
    }
  
    // Soft chime sound (multiple tones)
    playSoftChime(volume = 0.5) {
      return this.playChime([523.25, 659.25, 783.99], volume, 0.4);
    }
  
    // Digital beep sound (square wave)
    playDigitalBeep(volume = 0.5, duration = 0.2) {
      return this.playTone(1000, volume, duration, 'square');
    }
  
    // Notification sound (ascending tones)
    playNotification(volume = 0.5) {
      return this.playSequence([400, 600, 800], volume, 0.15);
    }
  
    // Success sound (major chord)
    playSuccess(volume = 0.5) {
      return this.playChord([261.63, 329.63, 392.00], volume, 0.5);
    }
  
    // Alert sound (warning tone)
    playAlert(volume = 0.5) {
      return this.playTone(440, volume, 0.5, 'sawtooth', true);
    }
  
    // Error sound (descending tones)
    playError(volume = 0.5) {
      return this.playSequence([600, 400, 200], volume, 0.2);
    }
  
    // Basic tone generator
    async playTone(frequency, volume = 0.5, duration = 0.3, waveType = 'sine', vibrato = false) {
      await this.ensureAudioContext();
      if (!this.audioContext) return;
  
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = waveType;
      
      if (vibrato) {
        const vibratoOsc = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        
        vibratoOsc.frequency.setValueAtTime(5, this.audioContext.currentTime);
        vibratoGain.gain.setValueAtTime(10, this.audioContext.currentTime);
        
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        
        vibratoOsc.start();
        vibratoOsc.stop(this.audioContext.currentTime + duration);
      }
      
      // Envelope for smoother sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
      return new Promise(resolve => {
        oscillator.onended = resolve;
      });
    }
  
    // Play multiple tones in sequence
    async playSequence(frequencies, volume = 0.5, noteDuration = 0.2) {
      for (let i = 0; i < frequencies.length; i++) {
        await this.playTone(frequencies[i], volume, noteDuration);
        if (i < frequencies.length - 1) {
          await this.delay(50); // Small gap between notes
        }
      }
    }
  
    // Play multiple tones simultaneously (chord)
    async playChord(frequencies, volume = 0.5, duration = 0.4) {
      await this.ensureAudioContext();
      if (!this.audioContext) return;
  
      const promises = frequencies.map(freq => 
        this.playTone(freq, volume / frequencies.length, duration)
      );
      
      await Promise.all(promises);
    }
  
    // Play chime effect
    async playChime(frequencies, volume = 0.5, duration = 0.4) {
      await this.ensureAudioContext();
      if (!this.audioContext) return;
  
      for (let i = 0; i < frequencies.length; i++) {
        setTimeout(() => {
          this.playTone(frequencies[i], volume * (1 - i * 0.2), duration);
        }, i * 100);
      }
      
      return this.delay(duration * 1000 + frequencies.length * 100);
    }
  
    // Utility delay function
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    // Clean up audio context
    close() {
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }
  
  // Sound options with Web Audio API generators
  export const soundOptions = [
    { 
      id: 'beep1', 
      name: 'Classic Beep', 
      generator: (soundGen, volume) => soundGen.playClassicBeep(volume / 100)
    },
    { 
      id: 'beep2', 
      name: 'Soft Chime', 
      generator: (soundGen, volume) => soundGen.playSoftChime(volume / 100)
    },
    { 
      id: 'beep3', 
      name: 'Digital Beep', 
      generator: (soundGen, volume) => soundGen.playDigitalBeep(volume / 100)
    },
    { 
      id: 'beep4', 
      name: 'Notification', 
      generator: (soundGen, volume) => soundGen.playNotification(volume / 100)
    },
    { 
      id: 'beep5', 
      name: 'Success Tone', 
      generator: (soundGen, volume) => soundGen.playSuccess(volume / 100)
    },
    { 
      id: 'beep6', 
      name: 'Alert Sound', 
      generator: (soundGen, volume) => soundGen.playAlert(volume / 100)
    },
    { 
      id: 'beep7', 
      name: 'Error Sound', 
      generator: (soundGen, volume) => soundGen.playError(volume / 100)
    },
  ];