const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const BOT_TOKEN = '7852601048:AAH7ktrLjL4oQQ21zzcVt9F7TuFrbB1VZq0';
const CHAT_ID = '@j22stream';
const VIDEO_LIST_PATH = path.join(__dirname, 'videos.json');
const videoFilePath = './sample-video.mp4';

async function uploadVideo() {
  const form = new FormData();
  form.append('chat_id', CHAT_ID);
  form.append('video', fs.createReadStream(videoFilePath));
  form.append('supports_streaming', true);
  form.append('caption', path.basename(videoFilePath));

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const result = response.data.result;
    const newVideo = {
      title: result.caption,
      file_id: result.video.file_id,
      thumbnail: "https://via.placeholder.com/300x170.png?text=" + encodeURIComponent(result.caption)
    };

    let videos = [];
    if (fs.existsSync(VIDEO_LIST_PATH)) {
      videos = JSON.parse(fs.readFileSync(VIDEO_LIST_PATH));
    }

    videos.unshift(newVideo);
    fs.writeFileSync(VIDEO_LIST_PATH, JSON.stringify(videos, null, 2));
    console.log('✅ Upload berhasil dan videos.json terupdate!');
  } catch (err) {
    console.error('❌ Gagal upload:', err.response?.data || err.message);
  }
}

uploadVideo();
