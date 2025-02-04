import React, { useState, useEffect, useRef } from 'react';
    import * as Tone from 'tone';
    import './App.css';
    
    const steps = 16;
    const initialBpm = 120;
    const initialTracks = ['Kick', 'Snare', 'Hi-Hat'];
    
    function App() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [bpm, setBpm] = useState(initialBpm);
      const [trackSequences, setTrackSequences] = useState({});
      const [currentStep, setCurrentStep] = useState(0);
      const [volumes, setVolumes] = useState({});
      const [pitches, setPitches] = useState({});
      const synths = useRef({});
      const sequences = useRef({});
    
      useEffect(() => {
        // Initialize Transport
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = '1m';
    
        // Initialize synths and volumes
        const initialVolumes = {};
        const initialPitches = {};
        initialTracks.forEach(track => {
          initialVolumes[track] = 0; // Default volume (0dB)
          initialPitches[track] = track === 'Kick' ? 'C2' : 'C4'; // Default pitches
          if (track === 'Kick') {
            synths.current[track] = new Tone.MembraneSynth().toDestination();
          } else if (track === 'Snare') {
            synths.current[track] = new Tone.NoiseSynth().toDestination();
          } else if (track === 'Hi-Hat') {
            synths.current[track] = new Tone.MetalSynth({
              frequency: 400,
              envelope: {
                attack: 0.001,
                decay: 0.1,
                release: 0.05
              },
              harmonicity: 5.1,
              modulationIndex: 32,
              resonance: 4000,
              octaves: 1
            }).toDestination();
          }
        });
        setVolumes(initialVolumes);
        setPitches(initialPitches);
    
        // Initialize sequences
        const newTrackSequences = {};
        initialTracks.forEach(track => {
          newTrackSequences[track] = Array(steps).fill(false);
        });
        setTrackSequences(newTrackSequences);
    
        // Schedule events
        const stepCounter = new Tone.Loop(time => {
          Tone.Draw.schedule(() => {
            setCurrentStep(step => (step + 1) % steps);
          }, time);
        }, '16n').start(0);
    
        return () => {
          stepCounter.dispose();
        };
      }, []);
    
      useEffect(() => {
        Tone.Transport.bpm.value = bpm;
      }, [bpm]);
    
      useEffect(() => {
        initialTracks.forEach(track => {
          if (synths.current[track] && volumes[track] !== undefined) {
            synths.current[track].volume.value = volumes[track];
          }
        });
      }, [volumes]);
    
      useEffect(() => {
        // Create sequences for each track
        initialTracks.forEach(track => {
          if (sequences.current[track]) {
            sequences.current[track].dispose();
          }
    
          sequences.current[track] = new Tone.Sequence(
            (time, step) => {
              if (trackSequences[track][step]) {
                const pitch = pitches[track];
                if (track === 'Kick') {
                  synths.current[track].triggerAttackRelease(pitch, '8n', time);
                } else if (track === 'Snare') {
                  synths.current[track].triggerAttackRelease('16n', time);
                } else if (track === 'Hi-Hat') {
                  synths.current[track].triggerAttackRelease(pitch, '16n', time);
                }
              }
            },
            Array.from(Array(steps).keys()),
            '16n'
          );
    
          sequences.current[track].start(0);
        });
    
        return () => {
          initialTracks.forEach(track => {
            if (sequences.current[track]) {
              sequences.current[track].dispose();
            }
          });
        };
      }, [trackSequences, pitches]);
    
      const togglePlay = async () => {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        if (isPlaying) {
          Tone.Transport.stop();
          setCurrentStep(0);
        } else {
          Tone.Transport.start();
        }
        setIsPlaying(!isPlaying);
      };
    
      const handleStepChange = (track, step) => {
        const newTrackSequences = { ...trackSequences };
        newTrackSequences[track][step] = !newTrackSequences[track][step];
        setTrackSequences(newTrackSequences);
      };
    
      const handleBpmChange = (event) => {
        setBpm(event.target.value);
      };
    
      const handleVolumeChange = (track, event) => {
        const newVolumes = { ...volumes };
        newVolumes[track] = parseFloat(event.target.value);
        setVolumes(newVolumes);
      };
    
      const handlePitchChange = (track, event) => {
        const newPitches = { ...pitches };
        newPitches[track] = event.target.value;
        setPitches(newPitches);
      };
    
      const handleClear = () => {
        const clearedTrackSequences = {};
        initialTracks.forEach(track => {
          clearedTrackSequences[track] = Array(steps).fill(false);
        });
        setTrackSequences(clearedTrackSequences);
      };
    
      return (
        <div className="beat-creator">
          <div className="controls">
            <button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</button>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={handleBpmChange}
            />
            <span>{bpm} BPM</span>
            <button onClick={handleClear}>Clear</button>
          </div>
          <div className="sequencer">
            {initialTracks.map(track => (
              <div key={track} className="track">
                <div className="track-label">{track}</div>
                <div className="track-controls">
                  <label>
                    Volume:
                    <input
                      type="range"
                      min="-60"
                      max="10"
                      value={volumes[track]}
                      onChange={(e) => handleVolumeChange(track, e)}
                    />
                  </label>
                  <label>
                    Pitch:
                    <select value={pitches[track]} onChange={(e) => handlePitchChange(track, e)}>
                      {track === 'Kick' && (
                        <>
                          <option value="C1">C1</option>
                          <option value="C2">C2</option>
                          <option value="G1">G1</option>
                          <option value="G2">G2</option>
                        </>
                      )}
                      {track === 'Snare' && (
                        <>
                          <option value="C4">C4</option>
                          <option value="D4">D4</option>
                          <option value="G4">G4</option>
                        </>
                      )}
                      {track === 'Hi-Hat' && (
                        <>
                          <option value="C2">C2</option>
                          <option value="C3">C3</option>
                          <option value="C4">C4</option>
                          <option value="C5">C5</option>
                        </>
                      )}
                    </select>
                  </label>
                </div>
                <div className="track-steps">
                  {trackSequences[track]?.map((step, index) => (
                    <button
                      key={index}
                      className={
                        `step ${step ? 'active' : ''} ` +
                        `${index === currentStep && isPlaying ? 'current' : ''}`
                      }
                      onClick={() => handleStepChange(track, index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    export default App;
