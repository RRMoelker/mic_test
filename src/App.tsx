import React, {useEffect, useState} from 'react';
import './App.css';
import {Box, Button, FormControl, FormControlLabel, Radio, RadioGroup} from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import SearchIcon from '@material-ui/icons/Search';
import DelaySlider from "./components/DelaySlider";

const AudioContext = window.AudioContext;

function App() {
    const minDelay = 0;
    const maxDelay = 3;
    const [supported, setSupported] = useState<boolean | string | undefined>(undefined);
    const [devices, setDevices] = useState<InputDeviceInfo[]>([]);
    const [micId, setMicId] = useState<string | undefined>();
    const [stream, setStream] = useState<MediaStream | undefined>()
    const [delay, setDelay] = useState(1);

    const checkSupported = () => {
        if (navigator.mediaDevices && AudioContext) {
            setSupported(true);
        } else {
            setSupported('The audio features required are not found on your browser.');
        }
    }
    useEffect(checkSupported, []);

    const getMicrophones = async () => {
        // First get permission:
        await navigator.mediaDevices.getUserMedia({audio: true, video: false})
            .then(() => console.log('success'));

        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === 'audioinput');
            console.log('found devices: ', devices);
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

        const delayNode = audioContext.createDelay(maxDelay);
        delayNode.delayTime.value = delay; // seconds

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

    const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        switchMic((event.target as HTMLInputElement).value);
    };


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
                    <Box fontSize="h4.fontSize" m={1}>
                      Record from an audio input device and play it back with a delay.
                    </Box>

                    <Box fontSize="h6.fontSize" m={2}>
                      Remember to not use the same input and audio device unless you want to go into a feedback loop.
                    </Box>

                    <div>
                        {devices.length === 0 && <Button onClick={getMicrophones}
                                                         startIcon={<SearchIcon/>}
                                                         variant="contained"
                                                         color="primary"
                        >Detect available
                          devices</Button>}
                    </div>
                  </div>
                    {devices.length > 0 && <>
                      <Box m={1}>
                        <DelaySlider
                          delay={delay}
                          setDelay={setDelay}
                          minDelay={minDelay}
                          maxDelay={maxDelay}
                          disabled={stream !== undefined}
                        />
                      </Box>
                      <Box m={1}>{stream
                          ? <div>
                              {stream && <Button onClick={stop}
                                                 startIcon={<StopIcon/>}
                                                 variant="contained"
                                                 color="primary"
                              >Stop</Button>}
                          </div>
                          : <div>
                              <Button onClick={start}
                                      startIcon={<MicIcon/>}
                                      variant="contained"
                                      color="primary"
                                      disabled={micId === undefined}
                              >Record</Button>
                          </div>
                      }
                      </Box>

                      <Box m={1}>
                        <FormControl component="fieldset">
                          <RadioGroup aria-label="deviceId" name="DeviceId" value={micId || false} onChange={onRadioChange}>
                              {devices.map(d => (
                                  <FormControlLabel key={d.deviceId} value={d.deviceId} control={<Radio/>}
                                                    label={d.label}/>

                              ))}
                          </RadioGroup>
                        </FormControl>
                      </Box>

                      <p>
                        <Button onClick={getMicrophones}
                                startIcon={<SearchIcon/>}
                                variant="contained"

                        >Refresh devices</Button>
                      </p>
                    </>}
                </>}
            </header>
        </div>
    );
}

export default App;
