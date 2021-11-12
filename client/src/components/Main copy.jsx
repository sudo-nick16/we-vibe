import React, { useEffect, useRef, useState } from 'react';
import {withWaveHeader} from '../wave-header'
import { io } from 'socket.io-client';

const socket = io('http://localhost:3005', {forceNew: true});

const audio = new Audio();
audio.controls = true;
audio.onend = () => {
    console.log('ended');
    socket.emit('songEnded');
}


const ctx = new AudioContext()
const mimeCodecs = 'audio/mp4; codecs="mp4a.40.2"'
var source;

class MasterOutput {
    constructor(computeSamplesCallback) {
      this.computeSamplesCallback = computeSamplesCallback.bind(this);
      this.onComputeTimeoutBound = this.onComputeTimeout.bind(this);
  
      this.audioContext = new AudioContext();
      this.sampleRate = this.audioContext.sampleRate;
      this.channelCount = 2; 
  
      this.totalBufferDuration = 5;
      this.computeDuration = 1;
      this.bufferDelayDuration = 0.1;
  
      this.totalSamplesCount = this.totalBufferDuration * this.sampleRate;
      this.computeDurationMS = this.computeDuration * 1000.0;
      this.computeSamplesCount = this.computeDuration * this.sampleRate;
      this.buffersToKeep = Math.ceil((this.totalBufferDuration + 2.0 * this.bufferDelayDuration) /
        this.computeDuration);
  
      this.audioBufferSources = [];
      this.computeSamplesTimeout = null;
    }
  
    startPlaying() {
      if (this.audioBufferSources.length > 0) {
        this.stopPlaying();
      }
  
      //Start computing indefinitely, from the beginning.
      let audioContextTimestamp = this.audioContext.getOutputTimestamp();
      this.audioContextStartOffset = audioContextTimestamp.contextTime;
      this.lastTimeoutTime = audioContextTimestamp.performanceTime;
      for (this.currentBufferTime = 0.0; this.currentBufferTime < this.totalBufferDuration;
        this.currentBufferTime += this.computeDuration) {
        this.bufferNext();
      }
      this.onComputeTimeoutBound();
    }
  
    onComputeTimeout() {
      this.bufferNext();
      this.currentBufferTime += this.computeDuration;
  
      //Readjust the next timeout to have a consistent interval, regardless of computation time.
      let nextTimeoutDuration = 2.0 * this.computeDurationMS - (performance.now() - this.lastTimeoutTime) - 1;
      this.lastTimeoutTime = performance.now();
      this.computeSamplesTimeout = setTimeout(this.onComputeTimeoutBound, nextTimeoutDuration);
    }
  
    bufferNext() {
      this.currentSamplesOffset = this.currentBufferTime * this.sampleRate;
  
      //Create an audio buffer, which will contain the audio data.
      this.audioBuffer = this.audioContext.createBuffer(this.channelCount, this.computeSamplesCount,
        this.sampleRate);
  
      //Get the audio channels, which are float arrays representing each individual channel for the buffer.
      this.channels = [];
      for (let channelIndex = 0; channelIndex < this.channelCount; ++channelIndex) {
        this.channels.push(this.audioBuffer.getChannelData(channelIndex));
      }
  
      //Compute the samples.
      this.computeSamplesCallback();
  
      //Creates a lightweight audio buffer source which can be used to play the audio data. Note: This can only be
      //started once...
      let audioBufferSource = this.audioContext.createBufferSource();
      //Set the audio buffer.
      audioBufferSource.buffer = this.audioBuffer;
      //Connect it to the output.
      audioBufferSource.connect(this.audioContext.destination);
      //Start playing when the audio buffer is due.
      audioBufferSource.start(this.audioContextStartOffset + this.currentBufferTime + this.bufferDelayDuration);
      while (this.audioBufferSources.length >= this.buffersToKeep) {
        this.audioBufferSources.shift();
      }
      this.audioBufferSources.push(audioBufferSource);
    }
  
    stopPlaying() {
      if (this.audioBufferSources.length > 0) {
        for (let audioBufferSource of this.audioBufferSources) {
            console.log(audioBufferSource)
            audioBufferSource.stop();
        }
        this.audioBufferSources = [];
        clearInterval(this.computeSamplesTimeout);
        this.computeSamplesTimeout = null;
      }
    }
}



let masterOutput = new MasterOutput(function() {
    //Populate the audio buffer with audio data.
    // let currentSeconds;
    // let frequency = 220.0;
    // for (let sampleIndex = 0; sampleIndex <= this.computeSamplesCount; ++sampleIndex) {
    // currentSeconds = (sampleIndex + this.currentSamplesOffset) / this.sampleRate;

    // //For a sine wave.
    // this.channels[0][sampleIndex] = 0.005 * Math.sin(currentSeconds * 2.0 * Math.PI * frequency);
    this.channels = [[], []]
    // //Copy the right channel from the left channel.
    // this.channels[1][sampleIndex] = this.channels[0][sampleIndex];
    // }
});

// masterOutput.startPlaying();



// const audio = new Audio();
var mediaSource = new MediaSource();
audio.src = window.URL.createObjectURL(mediaSource);

const sourceOpened = async () => {
    console.log('source opened');
    document.querySelector('#audio').appendChild(audio); 
    const sourceBuffer = mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
    sourceBuffer.mode = 'sequence';

    socket.on("songStream", async (data) =>{
        console.log("getting boi.... TT");
        if(!sourceBuffer.updating){
            console.log("appending to buffer")
            sourceBuffer.appendBuffer(data);
        }else{
            console.log("updating")
        }
        // console.log(masterOutput.audioBuffer)
        // var incomingData = new Uint8Array(data); // create a uint8 view on the ArrayBuffer
        // var i, l = incomingData.length; // length, we need this for the loop
        // var outputData = new Float32Array(incomingData.length); // create the Float32Array for output
        // for (i = 0; i < l; i++) {
        //     outputData[i] = (incomingData[i] - 128) / 128.0; // convert audio to float
        // }
        // console.log(outputData, outputData.length, ctx.sampleRate)
        // const buffer = ctx.createBuffer(2, outputData.length, 44100);
        // buffer.buffer = outputData;
        // // const buffer = await ctx.decodeAudioData(withWaveHeader(outputData, 2, 44100));
        // console.log(buffer)
        // let audioBufferSource = ctx.createBufferSource();
        // //Set the audio buffer.
        // audioBufferSource.buffer = buffer;
        // audioBufferSource.connect(ctx.destination);
        // audioBufferSource.start();

        //Connect it to the output.
        // audioBufferSource.connect(masterOutput.audioContext.destination);
        //Start playing when the audio buffer is due.
        // console.log(masterOutput.audioContextStartOffset + masterOutput.currentBufferTime + masterOutput.bufferDelayDuration)
        // audioBufferSource.start(0);
        
        // masterOutput.audioBufferSources.push(audioBufferSource);
        // masterOutput.audioBuffer.copyToChannel(data, 0);

        // masterOutput.startPlaying();
        // masterOutput.audioBufferSources.push(data);
        // masterOutput.startPlaying();
    })
    sourceBuffer.addEventListener('updateend', () => {
        console.log('update end');
        audio.play();
    })
}

mediaSource.addEventListener('sourceopen', sourceOpened);



const Main = () => {
    const joinBtn = useRef();
    const navBar = useRef()
    const user = JSON.parse(localStorage.getItem('user'));
    const message = useRef();
    const roomId = useRef();
    const [messages, setMessages] = useState([]);
    const [joined, setJoined] = useState(false);


    useEffect(() => {
        console.log(messages)
    }, [messages])
    useEffect(() => {
        socket.on('newMessage', (message) => {  
            setMessages(m =>{
                return [...m, {...message}];
            })
        })

        socket.on("playSong", (data) => {
            console.log(data, "should play songs")
            audio.src = data.url;
            audio.play();
        })

        socket.on("songStream", async (stream)=>{
            // console.log("getting boi.... TT", stream);
            // const audioBufferChunk = await arrayBufferToAudioBuffer(stream, ctx);
            // source.buffer = audioBufferChunk;
            // source
            // source.connect(ctx.destination);
            // source.start();
            
            // stream.addListener('data', async (data) =>{
            //     try{
            //         console.log(data);
            //         const audioBufferChunk = await arrayBufferToAudioBuffer(data, ctx);
            //         console.log(audioBufferChunk);
            //         source = ctx.createBufferSource();
            //         source.buffer = audioBufferChunk;
            //         source.connect(ctx.destination);
            //         source.start(0);
            //     }catch(e){
            //         console.log(e)
            //     }
            // })
        });
        // audio.src = stream;

    } , [])

    const stream = () => {
        if(message.current.value && roomId.current.value){
            console.log("streaming")
            const data = {
                roomId : roomId.current.value,
                song : message.current.value
            }
            // socket.emit('playSong', data);
            socket.emit("startStream", data);
        }
    }

    const submit = () => {
        console.log("emmitting message")
        if(message.current.value !== ''){
            const temp = {
                message: message.current.value,
                user: 'me'
            }
            setMessages((m) => { return [...m, {...temp}]});
            const data = {
                message: message.current.value,
                roomId: roomId.current.value,
                user : user.username
            }
            socket.emit('message', data);
            message.current.value = '';
        }
    }
    const joinRoom = () => {
        if(roomId.current.value){
            console.log("Joining");
            setJoined(true);

            joinBtn.current.style.disabled = true;

            socket.emit('joinRoom', roomId.current.value);
        }
    }
    return (
        <>  
            <div className="h-16 flex items-center bg-gray-800">
                <div className="" id="audio"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-4 text-white lg:hidden" onClick={()=>{
                    navBar.current.classList.toggle('hidden');
                }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div ref={navBar} id="nav-pane" className="hidden flex nav-height lg:w-nav-w flex-col absolute top-16 lg:static lg:flex lg:flex-row border-t-1 border-gray-600 bg-gray-800 text-white py-2 items-center">
                    <div className="justify-self-start">
                        <button ref={joinBtn} disabled={joined} className={`ml-2 bg-gray-600 py-1 px-4 rounded border border-transparent hover:border-gray-400 hover:bg-gray-700 ${joined && "cursor-not-allowed"}`} onClick={joinRoom}>{joined? "Joined" : "Join"}</button>
                        <button className="bg-gray-600 py-1 px-4 rounded border border-transparent hover:border-gray-400 ml-2 hover:bg-gray-700">Create</button>
                    </div>
                    <div className="mx-auto flex flex-col py-4 lg:flex-row lg:py-0">
                        <span className="w-auto mx-auto">Room Id : </span>
                        <input ref={roomId} type="text" className="w-auto border-0 ring-0 py-1 px-2 rounded-none bg-transparent border-b text-white" />
                    </div>
                </div>
                <div className="justify-self-end w-auto mr-2 ml-auto flex items-center">
                    {/* <h2 className="block">username</h2> */}
                    <img src={user.img} className="ml-2 w-11 h-11 object-cover rounded-full" alt="" />
                </div>
            </div>
            <div id="main-container" className="w-full h-nav-h bg-gray-100 flex">
                <div className="w-96 bg-gray-800 border-t hidden lg:flex lg:flex-col border-gray-600 items-center">
                    <span className="mt-4 text-xl text-white font-bold h-10 mb-2">Playlist</span>
                    <ul className="w-full">
                        {/* <li className="h-10 border-b-2 border-gray-800 flex justify-center items-center bg-gray-600 w-full">Nick</li> */}
                    </ul>
                </div>
                <div className="h-full w-full bg-gray-900 flex flex-col">
                    <div id="message-box" className="h-full flex flex-col border-t border-gray-600 overflow-scroll overflow-x-hidden p-4">
                        {   
                            messages.map((message, index) => {
                                return message.user !== 'me' ? (
                                <div className=" flex flex-row justify-start rounded-md" key={index}>
                                    <div className="p-1 flex flex-col">
                                        <div className="text-blue-300 text-xs w-auto">{message.user}</div>
                                        <div className="bg-blue-200 w-auto p-1 px-2 rounded">{message.message}</div>
                                    </div>
                                </div>
                                ):(
                                <div className=" flex flex-row justify-end rounded-md" key={index}>
                                    <div className="flex flex-col p-1 justify-center items-end">
                                        <div className="bg-red-200 p-1 px-2 rounded">{message.message}</div>
                                        <div className="text-red-500 text-xs">{message.user}</div>
                                    </div>
                                </div>
                                )
                            })
                        }
                    </div>
                    <div className="h-14 flex items-center justify-evenly">
                        <input ref={message} type="text" className="w-5/6 h-8" placeholder="Enter commands" onKeyUp={(e) => {
                            if(e.key === 'Enter'){
                                submit();
                                console.log("enter pressed");
                            }
                        }} />
                        <svg onClick={submit} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-300 transform rotate-90 cursor-pointer hover:text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <button className="bg-blue-300 rounded-sm px-2 py-1" onClick={stream}>Play</button>
                        <button className="bg-blue-300 rounded-sm px-2 py-1" onClick={() => {
                            console.log("playing")
                            audio.play()

                            }}>Play Audio</button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Main
