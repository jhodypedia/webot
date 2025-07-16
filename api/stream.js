const axios = require('axios');

const TOKEN = 'ISI_TOKEN_BOT_ANDA'; // Ganti token bot Anda

module.exports = async (req, res) => {
  const { file_id } = req.query;

  if (!file_id) return res.status(400).send('file_id kosong');

  try {
    const getFileUrl = `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${file_id}`;
    const response = await axios.get(getFileUrl);
    const filePath = response.data.result.file_path;

    const streamUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
    const stream = await axios({
      url: streamUrl,
      method: 'GET',
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'video/mp4');
    stream.data.pipe(res);
  } catch (error) {
    res.status(500).send('Gagal stream');
  }
};
