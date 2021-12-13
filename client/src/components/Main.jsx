import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { io } from 'socket.io-client';
import {v4 as uuid} from 'uuid';
import CustomAudio from './CustomAudio'
import { UserContext } from '../context/UserContext';
import track from './track.png'
import Login from './Login';
import dotenv from 'dotenv'
import Help from './Help';
dotenv.config()

const socket = io(process.env.REACT_APP_SOCKET_URL, {forceNew: true});

const audio = new Audio();

const time = (time) => {
    let minute = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minute}:${Math.ceil(seconds)}`
}

const Main = (props) => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('user'));
    const joinBtn = useRef();
    const navBar = useRef()
    const message = useRef();
    const roomId = useRef();
    const [messages, setMessages] = useState([]);
    const {userState, setUserState, userStateRef} = useContext(UserContext)
    const [profileView, setProfileView] = useState(props.profile)
    const [audioState, setAudioState] = useState({
        currTime : 0,
        duration : isNaN(audio.duration)? "0:00" : time(audio.duration),
        muted : false
    })
    const [showHelp, setShowHelp] = useState(false)
    
    useEffect(() => {
        if(userState.playlist.length === 1 && !userState.playing){
            audio.src = userState.playlist[0].url
            setUserState(user => ({...user, playing : true, currSong : user.playlist[0]}))
            audio.play()
        }
    }, [userState.playlist])
            
    useEffect(() => {
        const userDetails = localStorage.getItem("user");
        if(props.match.params.room_id){
            setUserState(user => ({...user, roomId: props.match.params.room_id}))
        }
        if(userDetails){
            setProfileView(false)
        }else{
            setProfileView(true);
        }

        audio.addEventListener('ended', () => {
            if(userStateRef.current.playlist.length > 1){
                audio.src = userStateRef.current.playlist[1].url;
                audio.play();
                setUserState(user => {
                    return {...user, playlist : [...user.playlist.slice(1)], currSong : user.playlist.slice(1)[0] || {url : "", title : "", thumbnail : ""}, playing : true}
                })      
            }else{
                audio.src = ""
                setUserState(user => ({...user, playlist : [], currSong : {url : "", title : "", thumbnail : ""}, playing : false}))      
            }

        })
        
        
        socket.on('new-message', data => {
            const temp = {
                message : data.message,
                user : data.user
            } 
            setMessages(m =>{
                return [...m, {...temp}];
            })
        })

        socket.on("trickle", data => {
            setUserState(user => ({...user,playlist : [...user.playlist, data]}));
        })

        
        socket.on("play-song", data => {
            setUserState(user => ({...user, playlist: [...user.playlist, data]}))
            // if(!userState.playing){
            //     audio.src = userState.playlist[0].url;
            //     audio.play();
            //     setUserState(user => ({...user, playing : true, currSong : user.playlist[0]}))
            // }
        })

        socket.on("pause-song", data => {
            audio.pause();
        })

        socket.on("resume-song", data => {
            audio.play();
            
        })
        
        socket.on("skip-song", data => {
            skip();
        })

        socket.on("reset-all", data => {
            audio.src = "";
            setUserState(user => ({...user, playlist : [], currSong : {url : "", title : "", thumbnail : ""}, playing : false}));
            setAudioState(audio => ({...audio, currTime : 0, duration : "0:00", muted : false}))
        })

    } , [])


    const sendMessage = () => {
        // console.log("sending message")
        if(message.current.value !== '' && roomId.current.value && userState.joined){
            const temp = {
                message: message.current.value,
                user: 'me'
            }
            setMessages((m) => { return [...m, {...temp}]});
            const data = {
                message: message.current.value,
                roomId: roomId.current.value,
                user : userState.username
            }
            
            switch(true){
                case data.message.split(" ")[0]=="?play": play(); break;
                case data.message.split(" ")[0]=="?pause": socket.emit("pause", roomId.current.value); break;
                case data.message.split(" ")[0]=="?resume": socket.emit("resume", roomId.current.value); break;
                case data.message.startsWith('?skip'): socket.emit("skip", roomId.current.value); break;
                case data.message.startsWith('?reset'): socket.emit("reset", roomId.current.value); break;

                case data.message.split(" ")[0]=="?p": play(); break;
                case data.message.split(" ")[0]=="?v": socket.emit("pause", roomId.current.value); break;
                case data.message.split(" ")[0]=="?r": socket.emit("resume", roomId.current.value); break;
                case data.message.split(" ")[0]=="?s": socket.emit("skip", roomId.current.value); break;
                case data.message.split(" ")[0]=="?rip": socket.emit("reset", roomId.current.value); break;
                default: break;
            }
            socket.emit('message', data);
            message.current.value = '';
        }
    }

    const joinRoom = () => {
        if(roomId.current.value){
            setUserState(t => ({...t, roomId: roomId.current.value, joined : true}))
            // console.log("Joining");
            joinBtn.current.style.disabled = true;
            socket.emit('join-room', roomId.current.value);
        }
    }

    const createRoom = () => {
        const randomRoomId = uuid();
        roomId.current.value = randomRoomId;
        joinRoom();
    }

    const leaveRoom = () => {
        socket.emit("leave-room", roomId.current.value);
        roomId.current.value = "";
        setUserState(curr => ({...curr, roomId : "", joined : false, currSong : {url : "", title : "", thumbnail : track}, playlist : [], playing : false}));
        setAudioState(audio => ({...audio, currTime : 0, duration : "0:00", muted : false}))
        audio.src = "";
        setMessages([])
    }

    const play = () => {
        let data = {
            roomId : roomId.current.value,
            song : (message.current.value).split(" ").slice(1).join(" ")
        }
        // console.log("Play the song", data.song)
        socket.emit("play", data);
    }

    const invite = () => {
        // console.log("Copied to clipboard")
        navigator.clipboard.writeText(window.location.host + "/" +roomId.current.value);
    }

    const skip = () => {
        // console.log("skipping")
        if(userStateRef.current.playlist.length > 1){
            // console.log("playing next", userStateRef.current.playlist.length)
            audio.src = userStateRef.current.playlist[1].url;
            audio.play();
            setUserState(user => ({...user, playlist : [...user.playlist.slice(1)], currSong : user.playlist.slice(1)[0] || {url : "", title : "", thumbnail : ""}, playing : true}))      
        }else{
            audio.src = ""
            setUserState(user => ({...user, playlist : [], currSong : {url : "", title : "", thumbnail : ""}, playing : false}))      
        }
    }

    return (
        // console.log("childs" , profileView),
        profileView?
        <Login cb={() => setProfileView(false)}  />
        :
        <>  
            <Help showHelp={showHelp} setShowHelp={setShowHelp} />
            <div className="h-16 flex items-center bg-cdark-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-4 text-white lg:hidden" onClick={()=>{
                    navBar.current.classList.toggle('hidden');
                }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>

                <div ref={navBar} id="nav-pane" className="hidden flex nav-height lg:w-nav-w flex-col absolute top-16 lg:static lg:flex lg:flex-row bg-cdark-3 lg:bg-cdark-2 text-white py-2 items-center">
                    <button ref={joinBtn} disabled={userState.joined} className={`mt-2 lg:ml-2 bg-green-600 py-1 px-4 rounded border border-transparent hover:border-clight-0 hover:bg-green-700 lg:mt-0 ${userState.joined && "cursor-not-allowed"}`} onClick={joinRoom}>{userState.joined? "Joined" : "Join"}</button>
                    { userState.joined ? 
                    <button className="bg-red-600 py-1 px-4 rounded border-0 border-transparent hover:border-clight-0 lg:mt-0 mt-2 lg:ml-2 hover:bg-red-700" onClick={leaveRoom} >Leave</button>
                        :
                    <button className="bg-cdark-0 py-1 px-4 rounded border border-transparent hover:border-clight-0 lg:mt-0 mt-2 lg:ml-2 hover:bg-cdark-2" onClick={createRoom} >Create</button>
                    }
                    {
                        userState.joined &&
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-2 lg:mt-0 lg:ml-2 cursor-pointer" fill="none" viewBox="0 0 24 24" onClick={invite} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    }
                    <div className="mx-auto flex flex-col py-4 lg:flex-row lg:py-0 text-red-500 font-bold">
                        <span className="w-auto mx-auto">Room Id : </span>
                        <input ref={roomId} readOnly={userState.joined} value={userState.roomId} onChange={(e) => setUserState(user => ({...user, roomId : e.target.value}))} type="text" className="w-80 border-0 text-sm border-cdark-0 text-center ring-0 py-1 px-1 rounded-none bg-transparent border-b text-white" />
                    </div>
                </div>

                <div className="justify-self-end w-auto mr-2 ml-auto flex items-center">
                    {/* <h2 className="block">{user.username}</h2> */}
                    <img src={user.img} className="ml-2 w-11 h-11 object-cover rounded-full cursor-pointer" alt="" onClick={() => setProfileView(true)} />
                </div>
            </div>
            <div id="main-container" className="w-full h-nav-h bg-cdark-1 flex">
                <div className="w-72 bg-cdark-3 hidden lg:flex lg:flex-col items-center">
                    <span className="mt-4 text-xl text-red-400 font-bold h-10 mb-2">Queue</span>
                    <ul className="w-full h-4/6 overflow-scroll">
                        {
                            userState.playlist.map((song, index) => {
                                return (       
                                    <li key={index} className={`h-12 px-2 m-1 text-sm text-white flex justify-start items-center hover:bg-cdark-0 w-auto ${index==0? "bg-cdark-0" : "bg-cdark-1"}`}>
                                        <img src={song.thumbnail || track} alt="" className="h-5 w-6 mx-1 mr-2" />
                                        <p className="truncate w-auto">
                                            {song.title}
                                        </p>
                                    </li> 
                                )
                            })
                        }  
                    </ul>
                    <CustomAudio audio = {audio} audioState = {audioState} setAudioState = {setAudioState} />
                </div>

                <div className="h-full w-full cdark-3 flex flex-col justify-around">
                    <div id="message-box" className="h-full flex flex-col overflow-scroll overflow-x-hidden p-4">
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
                    <div className="h-14 mt-auto bg-cdark-0 flex items-center justify-evenly">
                    <svg onClick={() => setShowHelp(true)} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-clight-2 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                        <input ref={message} type="text" className="w-5/6 h-8 px-2 py-1 outline-none rounded-sm bg-transparent border border-clight-3 text-clight-0 focus:border-2 focus:border-blue-500" placeholder="Enter commands" onKeyUp={(e) => {
                            if(e.key === 'Enter'){
                                sendMessage();
                                // console.log("enter pressed");
                            }
                        }} />
                        <svg onClick={sendMessage} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-clight-2 transform rotate-90 cursor-pointer hover:text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Main
