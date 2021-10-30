require("dotenv").config();
const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const ss = require('socket.io-stream');
const ytStream = require('youtube-audio-stream');
const yts = require('youtube-search-api');
const ytdl = require('ytdl-core')
const got = require('got');
const https = require('https');
const webrtc = require('wrtc');

var mp4Url;

const getAudioUrl = async(searchStr)=>{
    const data = await yts.GetListByKeyword(searchStr,[false]);
    let vidId = data['items'][0]['id'];
    let title = data['items'][0]['title'];
    let thumbnail = data['items'][0]['thumbnail']['thumbnails'][0]['url'];
    const songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${vidId}`)
    for(let i in songInfo['formats']){
        if(songInfo['formats'][i].hasOwnProperty('mimeType')){
            if(songInfo['formats'][i].mimeType === 'audio/mp4; codecs="mp4a.40.2"'){
            // if(songInfo['formats'][i].mimeType === 'audio/webm; codecs="opus"'){
                console.log(songInfo['formats'][i]);
                const song = {
                    url : songInfo['formats'][i].url,
                    title : title,
                    thumbnail : thumbnail
                }         
                return song;
            }
        }
    }
}

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    strict: false,
    allowedHeaders : ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
    enablePreflight: true,
    preflightContinue: true,
    optionsSuccessStatus : 200,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });

const server = app.listen(3005, () => {
    console.log('Server is running on port 3005');
});


const io = socket(server, {
    cors : {
        origin : "*"
    }
});




io.on("connection", socket => {

    // wConnection.onicecandidate = e => {
        //     var answer = wConnection.localDescription;
        //     console.log("ansswer");
        // }
        
socket.on("offer", data => {
    console.log(data);
    const wConnection = new webrtc.RTCPeerConnection(
        {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        }
    );
    wConnection.ondatachannel = e => {
        wConnection.dc = e.channel;
        wConnection.dc.onmessage = e => {
            console.log("message : " + e.data);
        }
        wConnection.dc.onopen = e => console.log("data channel open");
    }
    wConnection.setRemoteDescription(data.offer);
    wConnection.createAnswer()
    .then(ans => {
        wConnection.setLocalDescription(ans);
    })
    .then(e => {
        socket.emit("answer", wConnection.localDescription);
        console.log("answered");
    })
    socket.on("wrtc-message", data => {
        wConnection.dc.send(data.message);
    })
})

    console.log(socket.id);

    socket.on("startStream", async (song) => {
        try{
            const url = await getAudioUrl(song.song);
            const stream = got.stream(url);
            console.log(stream);
            let flag = true;
            stream.addListener("data", (data) => {
                if(flag){
                    console.log(data, "type : ", typeof(data));
                    flag = false;
                }
                io.to(song.roomId).emit("songStream", data);
            })
        }catch(err){
            console.log(err);
        }
    })
    
    socket.on("joinRoom",(data) => {
        console.log(data);
        socket.join(data);
    })


    socket.on("message", (data) => {
        console.log("data to be sent",data);
        // wConnection.dc.send(data.message)
        socket.to(data.roomId).emit("newMessage", data);
        // socket.broadcast.emit("newMessage", data);
    })
    socket.on("playSong", async (data) => {
        console.log(data, data.roomId)
        const song = await getAudioUrl(data.song)
        console.log(song)
        io.to(data.roomId).emit("playSong", song)
    })
    
})
