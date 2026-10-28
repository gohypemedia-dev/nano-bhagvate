import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/GHM/.gemini/antigravity-ide/brain/9143286a-54c0-4385-a47a-9693f71af3ce/.system_generated/logs/transcript_full.jsonl')
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  if (lineNum === 175) {
    try {
      const obj = JSON.parse(line);
      const text = obj.content || '';
      const m = text.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)[^\s"'<>]*/gi);
      console.log('URLs in step 174:', m);
    } catch (e) {
      console.error(e);
    }
  }
});
