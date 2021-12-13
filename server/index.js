require("dotenv").config();
const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const yts = require('youtube-search-api');
const ytdl = require('ytdl-core');
const ytps = require('yt-search');


const getAudioUrl = async(searchStr)=>{
    try{
        const data = await yts.GetListByKeyword(searchStr + "- song",[false]);
        let vidId = data['items'][0]['id'];
        let title = data['items'][0]['title'];
        let thumbnail = data['items'][0]['thumbnail']['thumbnails'][0]['url'];
        const songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${vidId}`)
        for(let i in songInfo['formats']){
            if(songInfo['formats'][i].hasOwnProperty('mimeType')){
                if(songInfo['formats'][i].mimeType === 'audio/mp4; codecs="mp4a.40.2"'){
                // if(songInfo['formats'][i].mimeType === 'audio/webm; codecs="opus"'){
                    // console.log(songInfo['formats'][i]);
                    const song = {
                        url : songInfo['formats'][i].url,
                        title : title,
                        thumbnail : thumbnail
                    }         
                    return song;
                }
            }
        }
    }catch(err){
        return false;
    }
}

const getPlaylist = async(listUrl)=>{
    let strIndex = listUrl.indexOf('list=')
    let listId = listUrl.substring(strIndex+5, listUrl.length)
    let list;
    try{
        list = await ytps({listId : listId})

    }catch(err){
        return false;
    }
    let videoIds = []
    for(let i in list.videos){
        videoIds.push(list.videos[i]["videoId"])
    }
    return videoIds
}

const getAudioById = async(id)=>{
    try{
        const songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`)
        for(let i in songInfo['formats']){
            if(songInfo['formats'][i].hasOwnProperty('mimeType')){
                if(songInfo['formats'][i].mimeType === 'audio/mp4; codecs="mp4a.40.2"'){
                // if(songInfo['formats'][i].mimeType === 'audio/webm; codecs="opus"'){
                    // console.log(songInfo['formats'][i]);
                    const song = {
                        url : songInfo['formats'][i].url,
                        thumbnail : `https://i.ytimg.com/vi/${id}/hq720.jpg`,
                        title : songInfo.videoDetails.title
                    }         
                    // console.log(song)
                    return song
                }
            }
        }
    }catch(err){
        const song = {
            url : "",
            thumbnail : "",
            title : ""
        }
        return song
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


const server = app.listen(process.env.PORT || 3005, () => {
    console.log('Server is running on port 3005');
});

const io = socket(server, {
    cors : {
        origin : "*"
    }
});

const ytId = (url) => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}


io.on("connection", async (socket) => {
    
    console.log("connected :", socket.id);
    
    socket.on('disconnect', () => {
        console.log('disconnected');
    })
    
    socket.on("join-room", async (data) => {
        console.log("Joining room => ",data);
        socket.join(data);
    })

    socket.on("leave-room", data => {
        console.log("Leaving room =>", data)
        socket.leave(data)
    })

    socket.on("message", (data) => {
        console.log("data to be sent",data);
        socket.to(data.roomId).emit("new-message", data);
    })

    socket.on("skip", roomId => {
        console.log("skip", roomId);
        io.to(roomId).emit("skip-song")
    })

    socket.on("reset", roomId => {
        console.log("reset", roomId);
        io.to(roomId).emit("reset-all")
    })

    const playlistHandler = async (props) => {
        const {vidIds, roomId} = props;
        for(let i of vidIds){
            const song = await getAudioById(i);
            io.to(roomId).emit("trickle", song);
        }
    }

    socket.on("play", async (data) => {
        if(data.song.includes("playlist?list=")){
            // console.log("playlist");
            console.log(data.song);
            const vidIds = await getPlaylist(data.song);
            // console.log(vidIds);
            if(!vidIds){
                console.log("playlist not found");
                return;
            }
            const song = await getAudioById(vidIds[0]);
            io.to(data.roomId).emit("trickle", song);
            vidIds.shift();
            playlistHandler({vidIds, roomId : data.roomId});
            return
        }else if(data.song.includes("watch?v=") || data.song.includes("youtu.be/")){
            const id = ytId(data.song);
            console.log(id)
            const song = await getAudioById(id);
            io.to(data.roomId).emit("play-song", song);
            return
        }
        const song = await getAudioUrl(data.song);
        io.to(data.roomId).emit("play-song", song)

    })

    socket.on("pause", roomId => {
        console.log("Pause", roomId)
        io.to(roomId).emit("pause-song");
    })

    socket.on("resume", roomId => {
        io.to(roomId).emit("resume-song");
    })
    
})

