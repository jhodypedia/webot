const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const filePath = path.join(__dirname, '../videos.json');
  const data = fs.readFileSync(filePath);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(data);
};
