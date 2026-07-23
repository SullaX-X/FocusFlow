import fs from 'fs';
const buf = fs.readFileSync('public/assets/Nightingale.mp3');
console.log(buf.slice(0, 10));
