import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `export type AudioNodeState = {
  source?: OscillatorNode | AudioBufferSourceNode;
  gain: GainNode;
  extra?: AudioNode[];
  intervals?: any[];
  stopFn?: () => void;
};`;

const replacement = `export type AudioNodeState = {
  source?: OscillatorNode | AudioBufferSourceNode;
  gain: GainNode;
  extra?: AudioNode[];
  intervals?: any[];
  stopFn?: () => void;
  audioEl?: HTMLAudioElement;
};`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
