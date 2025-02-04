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
      const transport = useRef(Tone.Transport);

      useEffect(() => {
        transport.current.bpm.value = bpm;
        transport.current.loop = true;
        transport.current.loopEnd = '1m';

        const newTrackSequences = {};
        initialTracks.forEach(track => {
          newTrackSequences[track] = Array(steps).fill(false);
        });
        setTrackSequences(newTrackSequences);

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
        transport.current.bpm.value = bpm;
      }, [bpm]);

      const togglePlay = async () => {
        if (!Tone.context.state === 'running') {
          await Tone.start();
        }
        if (isPlaying) {
          transport.current.stop();
          setCurrentStep(0);
        } else {
          transport.current.start();
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
            {Object.keys(trackSequences).map(track => (
              <div key={track} className="track">
                <div className="track-label">{track}</div>
                <div className="track-steps">
                  {trackSequences[track].map((step, index) => (
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
