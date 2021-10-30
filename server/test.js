const stream = require('youtube-audio-stream')
const ytdl = require('ytdl-core')
const yts = require('youtube-search-api');
const axios = require('axios');

const getAudioUrl = async(searchStr)=>{
    const data = await yts.GetListByKeyword(searchStr,[false]);
    // console.log(data);
    let vidId = data['items'][0]['id'];
    let title = data['items'][0]['title'];
    let thumbnail = data['items'][0]['thumbnail']['thumbnails'][0]['url'];
    // console.log(thumbnail);
    const songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${vidId}`);
    for(let i in songInfo['formats']){
        if(songInfo['formats'][i].hasOwnProperty('mimeType')){
            // console.log(songInfo['formats'][i])
            if(songInfo['formats'][i].mimeType === 'audio/mp4; codecs="mp4a.40.2"'){         
                // return songInfo['formats'][i].url
                console.log(songInfo['formats'][i]);
                break;
            }
        }
    }
}

// getAudioUrl("never gonna give you up")

async function run () {
    console.log('start');
    const res = await axios("https://r2---sn-pqx5jxaa0a5g-cage.googlevideo.com/videoplayback?expire=1635142554&ei=Ovd1YZD2NY3M4-EP5Zqw6AQ&ip=27.97.197.176&id=o-ALBq_HnUxnKmYSKdivvxF0Bu8rssQmEW32iNlsxRVUSi&itag=140&source=youtube&requiressl=yes&mh=7c&mm=31%2C29&mn=sn-pqx5jxaa0a5g-cage%2Csn-pqx5jxaa0a5g-h55l&ms=au%2Crdu&mv=m&mvi=2&pcm2cms=yes&pl=24&initcwndbps=283750&vprv=1&mime=audio%2Fmp4&ns=PQYBgKMm7xyCtgwi7QSClbEG&gir=yes&clen=3433514&dur=212.091&lmt=1628122153868652&mt=1635120531&fvip=4&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5532434&n=rdn0v0u3urBLBl4vpXQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAKhVy-2lbS7f7P10lwZg_YfrrlCzoNgEyU0RfnuAEa1PAiEAqJRqdm-02qZDbW0_WHfn58dl-HD_cC_Z6yEzJPYU_h4%3D&ratebypass=yes&sig=AOq0QJ8wRQIhAO3-HS1_r3yuN0hCGwqzBNXzCUmkX5uzdYXB1_1Jsm8VAiAC74TEfP9WuIoQ0dknxVnhBfH102vzL_8oygr78sdhtw%3D%3D")
    console.log(res.body)
    const rs = res.body
    rs.on("data", (chunk) => {
    console.log(chunk);
    })
    console.log(res.body)
}

run()