import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `            if (e.name !== "AbortError") {
              console.error("AudioEngine playback error for", absoluteUrl, e.message || e);
            }`;

const replacement = `            if (e.name !== "AbortError" && e.name !== "NotSupportedError" && e.name !== "NotAllowedError") {
              console.warn("AudioEngine playback error for", absoluteUrl, e.message || e);
            }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Suppressed non-critical audio errors.");
} else {
  console.log("Could not find target error block.");
}
