import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../services/ThemeContext';

interface Heart {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  oscillation: number;
  oscillationSpeed: number;
}

export default function HeartsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hearts = useRef<Heart[]>([]);
  const animationRef = useRef<number>(null);
  const { theme, powerSaving, showBackgroundEffects } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLight = theme === 'iman_love_light';
    const heartColor = isLight ? '219, 39, 119' : '236, 72, 153';

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const createHeart = (): Heart => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 5 + Math.random() * 15,
      speed: 0.5 + Math.random() * 1.5,
      opacity: isLight ? (0.05 + Math.random() * 0.1) : (0.1 + Math.random() * 0.3),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      oscillation: Math.random() * 100,
      oscillationSpeed: 0.01 + Math.random() * 0.02,
    });

    hearts.current = Array.from({ length: powerSaving ? 20 : 40 }, createHeart);

    let lastTime = 0;
    const fps = powerSaving ? 30 : 60;
    const interval = 1000 / fps;

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const width = size;
      const height = size;
      ctx.bezierCurveTo(-width / 2, -height / 2, -width, height / 3, 0, height);
      ctx.bezierCurveTo(width, height / 3, width / 2, -height / 2, 0, 0);
      ctx.fillStyle = `rgba(${heartColor}, ${opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const animate = (time: number) => {
      if (!showBackgroundEffects) return;
      
      const delta = time - lastTime;
      if (delta < interval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = time - (delta % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      hearts.current.forEach((heart, index) => {
        heart.y += heart.speed;
        heart.rotation += heart.rotationSpeed;
        heart.oscillation += heart.oscillationSpeed;
        
        const offsetX = Math.sin(heart.oscillation) * 1;
        
        drawHeart(ctx, heart.x + offsetX, heart.y, heart.size, heart.opacity, heart.rotation);

        if (heart.y > canvas.height + 20) {
          hearts.current[index] = createHeart();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [theme, powerSaving, showBackgroundEffects]);

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
