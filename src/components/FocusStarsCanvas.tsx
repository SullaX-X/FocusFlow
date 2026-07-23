import React, { useEffect, useRef, useMemo } from 'react';
import { Session } from '../types';
import { useTheme } from '../services/ThemeContext';

interface Props {
  sessions: Session[];
}

export default function FocusStarsCanvas({ sessions }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, showBackgroundEffects } = useTheme();
  
  // Use a ref to store stars so they don't jump on every tiny re-render
  const starsRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    
    const computedStyle = getComputedStyle(document.documentElement);
    let accentColor = computedStyle.getPropertyValue('--theme-accent').trim();
    if (!accentColor) accentColor = '#3b82f6';

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
      } else {
        canvas.width = window.innerWidth;
      }
      canvas.height = 300;
      
      // Initialize stars ONLY if we haven't or if canvas size drastically changed,
      // but actually we can just regenerate them if needed. 
      // To prevent jumping, let's just initialize once and scale if needed, or re-init on resize.
      // Re-init is okay on resize, but not on every render.
      
      const stars: any[] = [];
      // Better hash function for more randomness
      const cyrb53 = (str: string, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
          ch = str.charCodeAt(i);
          h1 = Math.imul(h1 ^ ch, 2654435761);
          h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
      };

      sessions.forEach(s => {
        const isDeep = s.isDeepWork;
        const hash1 = cyrb53(s.id, 1);
        const hash2 = cyrb53(s.id, 2);
        
        // Use modulus to get pseudo-random values between 0 and 1
        const randX = (hash1 % 10000) / 10000;
        const randY = (hash2 % 10000) / 10000;
        
        stars.push({
          id: s.id,
          x: randX * canvas.width,
          y: randY * canvas.height,
          size: isDeep ? ((hash1 % 20) / 10 + 1.5) : ((hash1 % 15) / 10 + 0.5),
          baseAlpha: isDeep ? 0.8 : 0.4,
          speed: ((hash2 % 100) / 100) * 0.01 + 0.002,
          color: isDeep ? accentColor : (theme === 'dark' ? '#ffffff' : '#000000'),
          pulsePhase: ((hash1 + hash2) % 100) / 100 * (Math.PI * 2),
          isDeep
        });
      });

      // Add background stars
      for (let i = 0; i < 50; i++) {
        const hash1 = cyrb53(`bg-${i}`, 1);
        const hash2 = cyrb53(`bg-${i}`, 2);
        stars.push({
          id: `bg-${i}`,
          x: ((hash1 % 10000) / 10000) * canvas.width,
          y: ((hash2 % 10000) / 10000) * canvas.height,
          size: ((hash1 % 30) / 10) * 0.5 + 0.5,
          baseAlpha: ((hash2 % 10) / 10) * 0.3 + 0.1,
          speed: ((hash1 % 100) / 100) * 0.01 + 0.002,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          pulsePhase: ((hash1 + hash2) % 100) / 100 * (Math.PI * 2),
          isDeep: false
        });
      }
      
      starsRef.current = stars;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      const currentStars = starsRef.current;

      currentStars.forEach(star => {
        // Subtle drift
        star.x += Math.sin(time * star.speed + star.pulsePhase) * 0.1;
        star.y += Math.cos(time * star.speed + star.pulsePhase) * 0.1;
        
        // Wrap around
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkle
        const twinkle = Math.sin(time * star.speed * 2 + star.pulsePhase) * 0.5 + 0.5;
        const currentAlpha = star.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // For deep work stars we already set it to accentColor
        ctx.fillStyle = star.color;
        
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Draw subtle connections between deep work stars
      const deepStars = currentStars.filter(s => s.isDeep);
      ctx.strokeStyle = accentColor;
      
      for (let i = 0; i < deepStars.length; i++) {
        for (let j = i + 1; j < deepStars.length; j++) {
          const dx = deepStars[i].x - deepStars[j].x;
          const dy = deepStars[i].y - deepStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(deepStars[i].x, deepStars[i].y);
            ctx.lineTo(deepStars[j].x, deepStars[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      
      if (showBackgroundEffects) {
        animationId = requestAnimationFrame(render);
      }
    };

    render(); // Always render at least once

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [sessions, theme, showBackgroundEffects]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full rounded-3xl"
      style={{ height: '300px', backgroundColor: 'var(--theme-bg)' }}
    />
  );
}
