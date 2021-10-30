import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import ss from 'socket.io-stream';
// import RTCMultiConnection from 'rtcmulticonnection';

// webrtc setup
const connection = new RTCPeerConnection(
    {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    }
);


connection.onicecandidate = (event) => {
    let offer = connection.localDescription;
    // console.log(offer);
}


const dc = connection.createDataChannel("channel");

connection.ondatachannel = e => {
    console.log("data channel is opened", e.channel)
    e.channel.onmessage = (e) => {
        console.log("message : ", e.data)
    }
}
dc.onmessage = (e) => {
    // sourceBuffer.appendBuffer(e.data)
    console.log("message : ", e.data)
}

dc.onopen = (e) => {
    console.log("data channel is opened")
}


const socket = io('http://localhost:3005', {forceNew: true});
var counter = 0;

const audio = new Audio();
// audio.on = () => {
//     audio.play();
// }

const ctx = new AudioContext()

const mediaSource = new MediaSource();
audio.src = window.URL.createObjectURL(mediaSource);
var queue = []
var sourceBuffer;

mediaSource.addEventListener('sourceopen', function(e) { console.log('sourceopen: ' + mediaSource.readyState); });
mediaSource.addEventListener('sourceended', function(e) { console.log('sourceended: ' + mediaSource.readyState); });
mediaSource.addEventListener('sourceclose', function(e) { console.log('sourceclose: ' + mediaSource.readyState); });
mediaSource.addEventListener('error', function(e) { console.log('error: ' + mediaSource.readyState); });
    
    
mediaSource.addEventListener('sourceopen', function(e){
    console.log('sourceopen');
    audio.play();
    try{
        sourceBuffer = mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
        
        sourceBuffer.addEventListener('updatestart', function(e) { console.log('updatestart: ' + mediaSource.readyState); });
        sourceBuffer.addEventListener('update', function(e) { console.log('update: ' + mediaSource.readyState); });
        sourceBuffer.addEventListener('updateend', function(e) { console.log('updateend: ' + mediaSource.readyState); });
        sourceBuffer.addEventListener('error', function(e) { console.log('error: ' + mediaSource.readyState); });
        sourceBuffer.addEventListener('abort', function(e) { console.log('abort: ' + mediaSource.readyState); });
        
        sourceBuffer.addEventListener('update', function() { // Note: Have tried 'updateend'
            if (queue.length > 0 && !sourceBuffer.updating) {
                sourceBuffer.appendBuffer(queue.shift());
            }
        });
        
        socket.on("songStream", data =>{
            
            if (typeof data !== 'string') {
                if (sourceBuffer.updating || mediaSource.readyState != "open" || queue.length > 0) {
                  queue.push(e.data);
                } else {
                    console.log("getting boi.... TT",data);
                  sourceBuffer.appendBuffer(data);
                }
            }

            // console.log("getting boi.... TT",data);
            // sourceBuffer.appendBuffer(data);
            audio.play();
        })
    }catch(e){
        console.log(e);
    }
});


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
        socket.on("answer", data =>{
            console.log("answer : " , data)
            connection.setRemoteDescription(data).
            then(e => console.log("connected ig", connection.remoteDescription))
        })

        socket.on('newMessage', (message) => {  
            counter++;
            console.log(counter)
            setMessages(m =>{
                return [...m, {...message}];
            })
        })

        socket.on("playSong", (data) => {
            console.log(data, "should play songs")
            audio.src = data.url;
            audio.play();
        })

        ss(socket).on("stream", (stream)=>{
            console.log("stream----",stream)
            audio.src = stream;
            audio.play();
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
            dc.send(message.current.value);
            setMessages((m) => { return [...m, {...temp}]});
            const data = {
                message: message.current.value,
                roomId: roomId.current.value,
                user : user.username
            }
            socket.emit('wrtc-message', data);
            socket.emit('message', data);
            message.current.value = '';
        }
    }
    const joinRoom = () => {
        if(roomId.current.value){
            console.log("Joining");
            connection.createOffer()
            .then(offer2 => {
                connection.setLocalDescription(offer2);
                socket.emit('offer', {
                    offer: offer2,
                    roomId: roomId.current.value,
                    user: user.username
                });
            })
            .then(e => console.log("set successfully"))

            setJoined(true);
            joinBtn.current.style.disabled = true;
            socket.emit('joinRoom', roomId.current.value);
        }
    }
    return (
        <>  
            <div className="h-16 flex items-center bg-gray-800">
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
