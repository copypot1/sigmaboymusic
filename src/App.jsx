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
      const synths = useRef({});
      const sequences = useRef({});
    
      useEffect(() => {
        // Initialize Transport
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = '1m';
    
        // Initialize synths
        synths.current['Kick'] = new Tone.MembraneSynth().toDestination();
        synths.current['Snare'] = new Tone.NoiseSynth().toDestination();
        synths.current['Hi-Hat'] = new Tone.MetalSynth({
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
        // Create sequences for each track
        initialTracks.forEach(track => {
          if (sequences.current[track]) {
            sequences.current[track].dispose();
          }
    
          sequences.current[track] = new Tone.Sequence(
            (time, step) => {
              if (trackSequences[track][step]) {
                if (track === 'Kick') {
                  synths.current[track].triggerAttackRelease('C2', '8n', time);
                } else if (track === 'Snare') {
                  synths.current[track].triggerAttackRelease('16n', time);
                } else if (track === 'Hi-Hat') {
                  synths.current[track].triggerAttackRelease('C2', '16n', time);
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
      }, [trackSequences]);
    
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
          </div>
          <div className="sequencer">
            {initialTracks.map(track => (
              <div key={track} className="track">
                <div className="track-label">{track}</div>
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
