import canvasConfetti from 'canvas-confetti';

let myConfetti: any = canvasConfetti;

if (typeof document !== 'undefined') {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '3001';
  document.body.appendChild(canvas);
  
  myConfetti = canvasConfetti.create(canvas, {
    resize: true,
    useWorker: false
  });
}

export default myConfetti;
