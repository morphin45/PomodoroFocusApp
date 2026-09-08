import { useState, useRef, useEffect } from 'react';

interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  description: string;
  frequency: number;
  isPremium: boolean;
}

const SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️', description: 'Gentle rainfall', frequency: 200, isPremium: false },
  { id: 'thunder', name: 'Thunderstorm', icon: '⛈️', description: 'Rain with thunder', frequency: 150, isPremium: true },
  { id: 'forest', name: 'Forest', icon: '🌲', description: 'Birds and wind', frequency: 400, isPremium: false },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', description: 'Calm waves', frequency: 180, isPremium: true },
  { id: 'fire', name: 'Fireplace', icon: '🔥', description: 'Crackling fire', frequency: 250, isPremium: true },
  { id: 'cafe', name: 'Coffee Shop', icon: '☕', description: 'Ambient chatter', frequency: 300, isPremium: true },
  { id: 'wind', name: 'Wind', icon: '💨', description: 'Gentle breeze', frequency: 220, isPremium: false },
  { id: 'birds', name: 'Birds', icon: '🐦', description: 'Morning birds', frequency: 500, isPremium: false },
  { id: 'white-noise', name: 'White Noise', icon: '📻', description: 'Pure white noise', frequency: 350, isPremium: false },
  { id: 'brown-noise', name: 'Brown Noise', icon: '🎵', description: 'Deep brown noise', frequency: 120, isPremium: true },
  { id: 'piano', name: 'Piano', icon: '🎹', description: 'Soft piano', frequency: 440, isPremium: true },
  { id: 'lofi', name: 'Lo-Fi Beats', icon: '🎧', description: 'Chill beats', frequency: 280, isPremium: true },
];

interface AmbientSoundsProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

export default function AmbientSounds({ isPremium, onUpgrade }: AmbientSoundsProps) {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  const createNoise = (context: AudioContext, type: 'white' | 'brown' | 'pink') => {
    const bufferSize = 2 * context.sampleRate;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    } else {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1529400;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    }

    return buffer;
  };

  const playSound = (sound: AmbientSound) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContextRef.current;
    
    // Stop any existing sound
    stopSound();

    // Create gain node
    const gainNode = context.createGain();
    gainNode.gain.value = volume * 0.3;
    gainNode.connect(context.destination);
    gainNodeRef.current = gainNode;

    // Create noise buffer for ambient sounds
    const noiseType = sound.id === 'white-noise' ? 'white' : 
                      sound.id === 'brown-noise' ? 'brown' : 'pink';
    
    const buffer = createNoise(context, noiseType);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    // Add filter for different sound characteristics
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = sound.frequency;
    
    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    
    noiseNodeRef.current = source;
  };

  const stopSound = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {
        // Ignore errors
      }
      noiseNodeRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Ignore errors
      }
      oscillatorRef.current = null;
    }
  };

  const handleSoundClick = (sound: AmbientSound) => {
    if (sound.isPremium && !isPremium) {
      onUpgrade();
      return;
    }

    if (activeSound === sound.id) {
      stopSound();
      setActiveSound(null);
    } else {
      playSound(sound);
      setActiveSound(sound.id);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume * 0.3;
    }
  };

  const freeSounds = SOUNDS.filter(s => !s.isPremium);
  const premiumSounds = SOUNDS.filter(s => s.isPremium);

  return (
    <div className="ambient-sounds">
      <div className="sounds-header">
        <h2>Ambient Sounds</h2>
        <p className="sounds-subtitle">Immerse yourself in focus-enhancing sounds</p>
      </div>

      {activeSound && (
        <div className="now-playing">
          <div className="now-playing-icon">🎵</div>
          <div className="now-playing-info">
            <div className="now-playing-title">
              Now Playing: {SOUNDS.find(s => s.id === activeSound)?.name}
            </div>
            <div className="volume-control">
              <span>🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span>🔊</span>
            </div>
          </div>
          <button className="stop-sound-btn" onClick={() => { stopSound(); setActiveSound(null); }}>
            Stop
          </button>
        </div>
      )}

      <div className="sounds-section">
        <h3>Free Sounds</h3>
        <div className="sounds-grid">
          {freeSounds.map(sound => (
            <button
              key={sound.id}
              className={`sound-card ${activeSound === sound.id ? 'active' : ''}`}
              onClick={() => handleSoundClick(sound)}
            >
              <div className="sound-icon">{sound.icon}</div>
              <div className="sound-name">{sound.name}</div>
              <div className="sound-description">{sound.description}</div>
              {activeSound === sound.id && (
                <div className="sound-playing-indicator">
                  <span></span><span></span><span></span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="sounds-section">
        <h3>Premium Sounds {!isPremium && <span className="pro-badge">PRO</span>}</h3>
        <div className="sounds-grid">
          {premiumSounds.map(sound => (
            <button
              key={sound.id}
              className={`sound-card ${activeSound === sound.id ? 'active' : ''} ${!isPremium ? 'premium-locked' : ''}`}
              onClick={() => handleSoundClick(sound)}
            >
              {!isPremium && <div className="premium-lock">🔒</div>}
              <div className="sound-icon">{sound.icon}</div>
              <div className="sound-name">{sound.name}</div>
              <div className="sound-description">{sound.description}</div>
              {activeSound === sound.id && (
                <div className="sound-playing-indicator">
                  <span></span><span></span><span></span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {!isPremium && (
        <div className="sounds-upgrade">
          <p>Unlock 8 more premium ambient sounds to enhance your focus</p>
          <button className="upgrade-btn" onClick={onUpgrade}>
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
}
