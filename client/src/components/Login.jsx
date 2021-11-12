import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { UserContext } from '../context/UserContext';
import pfp from '../images/default.png'

const Login = ({cb}) => {
    const {userState, setUserState} = useContext(UserContext);
    const [img, setImg] = useState(userState.img || pfp);
    const [imgBlob, setImgBlob] = useState(userState.img || pfp);
    const history = useHistory();
    console.log(useContext(UserContext))

    const nextBtnHandler = (cb) => {
        if(userState.username.trim() || imgBlob) {
            localStorage.setItem('user', JSON.stringify({
                username: userState.username,
                img: imgBlob
            }));
            setUserState(u => ({...u, img : imgBlob}))
            history.push('/');
        }
        if(cb){
            cb();
        }
    }
    return (
        <div className="h-full w-full flex justify-center items-center bg-cdark-3">
            <div className="flex flex-col h-80 rounded-md w-80 p-4 items-center bg-cdark-2 border border-cdark-2 shadow-md">
                <h1 className="text-white mt-2 text-center text-xl font-bold">Profile</h1>
                <div className="w-full flex justify-center items-center">
                    <label className="mt-4" htmlFor="pfp-upload">
                        <img className="w-28 h-28 p-0 my-auto rounded-full object-cover" src={img} alt="" />
                    </label>
                    <input className="hidden" type="file" id="pfp-upload" onChange={(e)=>{
                        if( e.target.files[0]){
                            const b = new FileReader();
                            b.readAsDataURL(e.target.files[0]);
                            b.onloadend = () => {
                                setImgBlob(b.result);
                            }
                            setImg(URL.createObjectURL(e.target.files[0]));
                        }
                    }} />
                </div>
                <input value = {userState.username} className="mt-4 block text-md rounded px-2 py-1 bg-transparent border border-cdark-0 text-red-400 font-bold" onChange={e => setUserState(curr => ({...curr, username : e.target.value}))} type="text" placeholder="Enter username" />
                <button onClick={() => nextBtnHandler(cb)} className="mt-4 text-sm px-4 py-1 border hover:border-transparent rounded border-cdark-0 hover:bg-cdark-3 text-green-600">Next</button>
            </div>
        </div>
    )
}

export default Login
