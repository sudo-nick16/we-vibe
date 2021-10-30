import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import pfp from '../images/default.png'

const Login = () => {
    const [img, setImg] = useState(pfp);
    const username = useRef();
    const [imgBlob, setImgBlob] = useState(pfp);
    const history = useHistory();

    if(localStorage.getItem('user')){
        history.push('/home');
    }

    const nextBtnHandler = () => {
        if(username.current.value.trim() || imgBlob) {
            localStorage.setItem('user', JSON.stringify({
                username: username.current.value,
                img: imgBlob
            }));
            history.push('/home');
        }
    }
    return (
        <div className="h-full w-full flex justify-center items-center">
            <div className="flex flex-col h-80 rounded-md w-80 p-4 items-center bg-gray-800">
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
                <input ref={username} className="mt-4 block" type="text" placeholder="Enter username" />
                <button onClick={nextBtnHandler} className="mt-4 px-4 py-1 bg-gray-800  border-2 hover:border-transparent rounded border-gray-600 hover:bg-gray-600 text-white">Next</button>
            </div>
        </div>
    )
}

export default Login
