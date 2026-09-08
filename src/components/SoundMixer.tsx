import { useState, useRef, useEffect } from 'react';

interface SoundMixerProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

interface MixerTrack {
  id: string;
  name: string;
  icon: string;
  volume: number;
  isPlaying: boolean;
  isPro: boolean;
}

const MIXER_TRACKS: MixerTrack[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️', volume: 50, isPlaying: false, isPro: false },
  { id: 'thunder', name: 'Thunder', icon: '⛈️', volume: 30, isPlaying: false, isPro: true },
  { id: 'forest', name: 'Forest', icon: '🌲', volume: 40, isPlaying: false, isPro: false },
  { id: 'ocean', name: 'Ocean', icon: '🌊', volume: 35, isPlaying: false, isPro: true },
  { id: 'fire', name: 'Fireplace', icon: '🔥', volume: 45, isPlaying: false, isPro: true },
  { id: 'cafe', name: 'Café', icon: '☕', volume: 25, isPlaying: false, isPro: true },
  { id: 'wind', name: 'Wind', icon: '💨', volume: 30, isPlaying: false, isPro: false },
  { id: 'birds', name: 'Birds', icon: '🐦', volume: 35, isPlaying: false, isPro: false },
];

export default function SoundMixer({ isPremium, onUpgrade }: SoundMixerProps) {
  const [tracks, setTracks] = useState<MixerTrack[]>(MIXER_TRACKS);
  const [masterVolume, setMasterVolume] = useState(70);
  const [presets, setPresets] = useState([
    { id: '1', name: 'Deep Focus', icon: '🎯', tracks: ['rain', 'forest'] },
    { id: '2', name: 'Creative Flow', icon: '🎨', tracks: ['cafe', 'birds'] },
    { id: '3', name: 'Calm Mind', icon: '🧘', tracks: ['ocean', 'wind'] },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map());

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      oscillatorsRef.current.forEach(({ osc }) => osc.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const toggleTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    if (track.isPro && !isPremium) {
      onUpgrade();
      return;
    }

    const newTracks = tracks.map(t => 
      t.id === trackId ? { ...t, isPlaying: !t.isPlaying } : t
    );
    setTracks(newTracks);

    if (!track.isPlaying) {
      startTrack(trackId, track.volume);
    } else {
      stopTrack(trackId);
    }
  };

  const startTrack = (trackId: string, volume: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Create different sounds for each track
    switch (trackId) {
      case 'rain':
        osc.type = 'sawtooth';
        osc.frequency.value = 200;
        break;
      case 'thunder':
        osc.type = 'square';
        osc.frequency.value = 80;
        break;
      case 'forest':
        osc.type = 'sine';
        osc.frequency.value = 400;
        break;
      case 'ocean':
        osc.type = 'sine';
        osc.frequency.value = 150;
        break;
      case 'fire':
        osc.type = 'sawtooth';
        osc.frequency.value = 300;
        break;
      case 'cafe':
        osc.type = 'triangle';
        osc.frequency.value = 500;
        break;
      case 'wind':
        osc.type = 'sine';
        osc.frequency.value = 250;
        break;
      case 'birds':
        osc.type = 'sine';
        osc.frequency.value = 800;
        break;
    }

    gain.gain.value = (volume / 100) * (masterVolume / 100) * 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscillatorsRef.current.set(trackId, { osc, gain });
  };

  const stopTrack = (trackId: string) => {
    const trackData = oscillatorsRef.current.get(trackId);
    if (trackData) {
      trackData.osc.stop();
      oscillatorsRef.current.delete(trackId);
    }
  };

  const updateVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(t => 
      t.id === trackId ? { ...t, volume } : t
    ));

    const trackData = oscillatorsRef.current.get(trackId);
    if (trackData) {
      trackData.gain.gain.value = (volume / 100) * (masterVolume / 100) * 0.1;
    }
  };

  const updateMasterVolume = (volume: number) => {
    setMasterVolume(volume);
    oscillatorsRef.current.forEach(({ gain }, trackId) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        gain.gain.value = (track.volume / 100) * (volume / 100) * 0.1;
      }
    });
  };

  const loadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    // Stop all tracks
    tracks.forEach(track => {
      if (track.isPlaying) {
        stopTrack(track.id);
      }
    });

    // Start preset tracks
    const newTracks = tracks.map(t => ({
      ...t,
      isPlaying: preset.tracks.includes(t.id),
      volume: 50,
    }));
    setTracks(newTracks);

    preset.tracks.forEach(trackId => {
      startTrack(trackId, 50);
    });
  };

  const activeTracks = tracks.filter(t => t.isPlaying).length;

  return (
    <div className="sound-mixer">
      <div className="mixer-header">
        <h2>🎛️ Sound Mixer</h2>
        <p className="mixer-subtitle">Mix and match ambient sounds for perfect focus</p>
      </div>

      <div className="mixer-presets">
        <h3>Quick Presets</h3>
        <div className="preset-buttons">
          {presets.map(preset => (
            <button
              key={preset.id}
              className="preset-btn"
              onClick={() => loadPreset(preset.id)}
            >
              <span className="preset-icon">{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="master-volume">
        <div className="volume-label">
          <span>🔊 Master Volume</span>
          <span>{masterVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={(e) => updateMasterVolume(parseInt(e.target.value))}
          className="master-slider"
        />
      </div>

      <div className="mixer-tracks">
        <h3>Sound Tracks ({activeTracks} active)</h3>
        <div className="tracks-grid">
          {tracks.map(track => (
            <div
              key={track.id}
              className={`mixer-track ${track.isPlaying ? 'active' : ''} ${track.isPro && !isPremium ? 'locked' : ''}`}
            >
              <div className="track-header">
                <button
                  className="track-toggle"
                  onClick={() => toggleTrack(track.id)}
                >
                  <span className="track-icon">{track.icon}</span>
                  <span className="track-name">{track.name}</span>
                  {track.isPro && !isPremium && (
                    <span className="track-lock">🔒</span>
                  )}
                </button>
              </div>
              {track.isPlaying && (
                <div className="track-volume">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={track.volume}
                    onChange={(e) => updateVolume(track.id, parseInt(e.target.value))}
                    className="track-slider"
                  />
                  <span className="volume-value">{track.volume}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!isPremium && (
        <div className="mixer-upgrade">
          <div className="upgrade-content">
            <h3>🎵 Unlock All Sounds</h3>
            <p>Get access to all 8 ambient sounds and create custom mixes</p>
            <button className="upgrade-btn" onClick={onUpgrade}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
