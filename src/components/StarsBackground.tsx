import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

import { useTheme } from '../services/ThemeContext';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: number;
  twinkleSpeed: number;
}

export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<Star[]>([]);
  const animationRef = useRef<number>(null);
  const { powerSaving, showBackgroundEffects } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars.current = Array.from({ length: powerSaving ? 50 : 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random() * 0.5,
        twinkle: Math.random() * Math.PI,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
      }));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = 0;
    const fps = powerSaving ? 30 : 60;
    const interval = 1000 / fps;

    const animate = (time: number) => {
      if (!showBackgroundEffects) return;
      
      const delta = time - lastTime;
      if (delta < interval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = time - (delta % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach((star) => {
        star.twinkle += star.twinkleSpeed;
        const opacity = showBackgroundEffects ? (star.opacity + Math.sin(star.twinkle) * 0.2) : star.opacity;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, opacity)})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [powerSaving, showBackgroundEffects]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
}
