const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const FormData = require('form-data');

// === Konfigurasi ===
const BOT_TOKEN = '7852601048:AAH7ktrLjL4oQQ21zzcVt9F7TuFrbB1VZq0';
const CHANNEL_ID = '@j22stream'; // channel atau -100xxxxxx
const ADMIN_ID = '5783449849';   // chat_id admin
const VIDEO_FOLDER = path.join(__dirname, 'videos');
const VIDEO_LIST_PATH = path.join(__dirname, 'videos.json');
const PORT = process.env.PORT || 3001;

// === Util ===
function formatDateName() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

// === Upload Video ke Telegram ===
async function uploadVideo(filePath) {
  const timestampTitle = "Video_" + formatDateName();
  const form = new FormData();
  form.append('chat_id', CHANNEL_ID);
  form.append('video', fs.createReadStream(filePath));
  form.append('supports_streaming', true);
  form.append('caption', timestampTitle);

  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,
      form,
      { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity }
    );

    const result = res.data.result;
    const videoFileId = result.video.file_id;
    const thumbFileId = result.video.thumb?.file_id;

    const newVideo = {
      title: timestampTitle,
      file_id: videoFileId,
      thumbnail: `https://api.telegram.org/file/bot${BOT_TOKEN}/${thumbFileId}`
    };

    // simpan ke videos.json
    let videos = [];
    if (fs.existsSync(VIDEO_LIST_PATH)) {
      videos = JSON.parse(fs.readFileSync(VIDEO_LIST_PATH));
    }
    videos.unshift(newVideo);
    fs.writeFileSync(VIDEO_LIST_PATH, JSON.stringify(videos, null, 2));
    console.log(`✅ Uploaded: ${timestampTitle}`);

    // kirim ke admin
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      chat_id: ADMIN_ID,
      photo: thumbFileId,
      caption: `📤 *${timestampTitle}* berhasil diupload ke J22Stream`,
      parse_mode: "Markdown"
    });

  } catch (err) {
    console.error('❌ Upload gagal:', err.response?.data || err.message);
  }
}

// === Jalankan semua upload video ===
async function uploadAll() {
  if (!fs.existsSync(VIDEO_FOLDER)) {
    console.error('❌ Folder "videos/" tidak ditemukan.');
    return;
  }

  const files = fs.readdirSync(VIDEO_FOLDER).filter(f => f.endsWith('.mp4'));
  if (!files.length) {
    console.log('📂 Tidak ada file .mp4 untuk diupload.');
    return;
  }

  for (const file of files) {
    const fullPath = path.join(VIDEO_FOLDER, file);
    await uploadVideo(fullPath);
  }
}

// === API Express untuk frontend ===
const app = express();
app.use(cors());

app.get('/api/videos', (req, res) => {
  if (!fs.existsSync(VIDEO_LIST_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(VIDEO_LIST_PATH));
  res.json(data);
});

app.get('/api/stream/:file_id', async (req, res) => {
  const fileId = req.params.file_id;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;

  try {
    const tgRes = await axios.get(url);
    const filePath = tgRes.data.result.file_path;
    res.redirect(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
  } catch (err) {
    res.status(500).send('Gagal redirect file');
  }
});

app.use('/', express.static(__dirname)); // serve index.html

app.listen(PORT, () => {
  console.log(`🚀 API & UI aktif di http://localhost:${PORT}`);
  uploadAll(); // langsung upload setelah server aktif
});
