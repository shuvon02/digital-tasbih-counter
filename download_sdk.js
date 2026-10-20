const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip';
const dest = 'D:\\cmdline-tools.zip';

console.log('Starting download of Android cmdline-tools...');
const file = fs.createWriteStream(dest);

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed with status:', res.statusCode);
    return;
  }
  const total = parseInt(res.headers['content-length'], 10);
  let downloaded = 0;
  let lastLog = 0;

  res.on('data', (chunk) => {
    downloaded += chunk.length;
    const now = Date.now();
    if (now - lastLog > 2000) {
      console.log(`Progress: ${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB (${Math.round(downloaded / total * 100)}%)`);
      lastLog = now;
    }
  });

  res.pipe(file);

  file.on('finish', () => {
    file.close(() => {
      console.log('Download complete: ' + dest);
    });
  });
}).on('error', (err) => {
  fs.unlink(dest, () => {});
  console.error('Error downloading:', err.message);
});
