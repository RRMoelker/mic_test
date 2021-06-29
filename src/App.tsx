import React, {useEffect, useState} from 'react';
import './App.css';

const AudioContext = window.AudioContext;

function App() {
    const [supported, setSupported] = useState<boolean | string | undefined>(undefined);
    const [devices, setDevices] = useState<InputDeviceInfo[]>([]);
    const [micId, setMicId] = useState<string | undefined>();
    const [stream, setStream] = useState<MediaStream | undefined>()

    const checkSupported = () => {
        if (navigator.mediaDevices && AudioContext) {
            setSupported(true);
        } else {
            setSupported('The audio features required are not found on your browser.');
        }
    }
    useEffect(checkSupported, []);

    const getMicrophones = async () => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === 'audioinput');
            setDevices(devices as InputDeviceInfo[]);
        });
    }

    const start = async () => {
        if (!micId) {
            throw new Error('missing capture device id');
        }
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia(
            {
                // audio: true // constraints - only audio needed for this app
                audio: {
                    deviceId: micId,
                }
            })
        setStream(stream);

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);

        const delayNode = audioContext.createDelay();
        delayNode.delayTime.value = 1; // seconds

        source.connect(delayNode).connect(audioContext.destination);
    }

    const stop = () => turnOffStream();

    const turnOffStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(undefined);
    }

    const switchMic = (deviceId: string) => {
        turnOffStream();
        setMicId(deviceId);
    }

    return (
        <div className="App">
            <header className="App-header">
                {supported === undefined
                && <>
                  <p>Checking browser for Audio APIs</p>
                </>}
                {supported === true
                && <>
                  <div>
                    <p>
                      Record from an audio input device and play it back with a delay.
                    </p>
                    <p className={'small'}>
                      Remember to not use the same input and audio device unless you want to go into a feedback loop.
                    </p>
                    <p>
                        {devices.length === 0 && <button onClick={getMicrophones}>Detect available devices</button>}
                    </p>
                  </div>

                    {devices.length > 0 && <>
                      <div>{stream
                          ? <div>
                              Recording {stream && <button onClick={stop}>Stop</button>}
                          </div>
                          : <div>
                              Not recording {micId && <button onClick={start}>Record</button>}
                          </div>
                      }
                      </div>
                      <h2>Devices</h2>
                      <ol className={'devices'}>
                          {devices.map(d => (
                              <li
                                  key={d.deviceId}
                                  className={micId === d.deviceId ? 'active' : ''}
                                  onClick={() => switchMic(d.deviceId)}
                              >{d.label}</li>
                          ))}
                      </ol>
                    </>}
                </>}
            </header>
        </div>
    );
}

export default App;
