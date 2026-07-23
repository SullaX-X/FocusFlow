import { useEffect, useRef } from 'react';

interface BrowserEngagementProps {
  isActive?: boolean;
  minutes?: number;
  seconds?: number;
  actualTheme: string;
  disabled?: boolean;
}

export function useBrowserEngagement({ isActive = false, minutes = 0, seconds = 0, actualTheme, disabled = false }: BrowserEngagementProps) {
  const originalTitle = useRef(document.title);
  const faviconCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    // Only capture original title if it's not our custom ones
    if (!document.title.includes("Вернись к фокусу!") && !document.title.startsWith("(")) {
        originalTitle.current = document.title;
    }

    const updateFavicon = (isInactive: boolean) => {
      if (!faviconCanvas.current) {
        faviconCanvas.current = document.createElement('canvas');
        faviconCanvas.current.width = 32;
        faviconCanvas.current.height = 32;
      }

      const canvas = faviconCanvas.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Theme colors
      const themeColors: Record<string, string> = {
        'light': '#2563eb',
        'dark': '#2563eb',
        'nordic': '#88c0d0',
        'latte': '#bc6c25',
        'oled': '#39ff14',
        'liquid-glass': '#60a5fa',
        'iman_love': '#ec4899',
        'dimoon': '#fde047',
        'dimoon-blue': '#38bdf8'
      };

      const color = themeColors[actualTheme] || '#2563eb';

      ctx.clearRect(0, 0, 32, 32);
      
      // Draw background circle
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fillStyle = isInactive ? '#64748b' : color;
      ctx.fill();

      // Draw Focus Icon
      ctx.fillStyle = (actualTheme === 'dimoon' || actualTheme === 'oled') ? '#000000' : '#ffffff';
      ctx.strokeStyle = ctx.fillStyle;
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();

      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = canvas.toDataURL('image/png');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isActive) {
          document.title = `(${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) Focus Moon`;
        } else {
          document.title = "Вернись к фокусу! | Focus Moon";
        }
        updateFavicon(true);
      } else {
        document.title = originalTitle.current;
        updateFavicon(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Update title immediately if hidden
    if (document.hidden) {
      if (isActive) {
        document.title = `(${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) Focus Moon`;
      } else {
        document.title = "Вернись к фокусу! | Focus Moon";
      }
      updateFavicon(true);
    } else {
      updateFavicon(false);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, minutes, seconds, actualTheme]);
}
