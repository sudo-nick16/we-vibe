import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/UserContext'
import track from './track.png'

const CustomAudio = ({audio, audioState, setAudioState, resetAudio}) => {
    const time = (time) => {
        let minute = Math.floor(time / 60);
        let seconds = time % 60;
        return `${minute}:${Math.ceil(seconds)}`
    }
    const {userState, setUserState} = useContext(UserContext);

    audio.onended = () => {
        setAudioState(curr => ({...curr, duration : "0:00"}))
    }
    audio.oncanplay = () => {
        setAudioState(curr => ({...curr, duration : isNaN(audio.duration)? "0:00" : time(audio.duration)}))
    }
    
    return (
        <div className="mt-auto">
            <div id="thumbnail" className="p-1 bg-cdark-2" >
                <img className="" src={userState.currSong.thumbnail || track} alt="" className="h-40 object-cover m-auto" />
            </div>
            <div id="controls" className=" w-full h-14 flex flex-row items-center px-2 mt-1 justify-around bg-cdark-2">
            {
                audioState.muted ? 
                <svg onClick={() => {
                    audio.muted = false;
                    setAudioState(c => ({...c, muted : false}))}
                    } xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer text-clight-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                :
                <svg onClick={() => {
                    audio.muted = true;
                    setAudioState(c => ({...c, muted : true}))}
                    } xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-clight-0 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
            }
            <div id="playback" className="h-6 w-48 overflow-x-hidden">
                <div className="text-clight-0 whitespace-nowrap animate-marquee">
                    {userState.currSong.title}
                </div>
            </div>
            <div id="duration" className="text-clight-0 px-2">
                {audioState.duration}
            </div>
        </div>
    </div>
    )
}

export default CustomAudio
