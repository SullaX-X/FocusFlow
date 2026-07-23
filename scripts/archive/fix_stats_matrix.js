import fs from 'fs';

let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// 1. Add import for FocusStarsCanvas
if (!content.includes('FocusStarsCanvas')) {
  content = content.replace(
    "import { useTheme } from '../ThemeContext';",
    "import { useTheme } from '../ThemeContext';\nimport FocusStarsCanvas from './FocusStarsCanvas';"
  );
}

// 2. Fix getIntensityInlineStyle
const oldIntensity = `const getIntensityInlineStyle = (minutes: number, isOutsideYear: boolean = false, isFuture: boolean = false) => {
    if (isFuture) return { backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)', borderWidth: '1px', opacity: 0.2 };
    if (minutes === 0) return { backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', borderWidth: '1px', opacity: isOutsideYear ? 0.2 : 0.4 };
    
    const ratio = Math.min(minutes / maxIntensity, 1);
    
    // Convert hex to rgb
    let r = 37, g = 99, b = 235; // default fallback blue
    if (colors.accent.startsWith('#')) {
      const hex = colors.accent.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }
    
    // Calculate opacity based on ratio, minimum 0.2
    const opacity = 0.2 + (ratio * 0.8);
    
    return {
      backgroundColor: \`rgba(\${r}, \${g}, \${b}, \${opacity})\`,
      boxShadow: minutes > maxIntensity * 0.7 ? \`0 0 10px rgba(\${r}, \${g}, \${b}, 0.5)\` : 'none',
      borderWidth: '0px'
    };
  };`;

const newIntensity = `const getIntensityInlineStyle = (minutes: number, isOutsideYear: boolean = false, isFuture: boolean = false) => {
    if (isFuture) return { backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px', opacity: 0.1 };
    if (minutes === 0) return { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderWidth: '1px', opacity: isOutsideYear ? 0.2 : 0.4 };
    
    const ratio = minutes / maxIntensity;
    let alpha = 0;
    if (ratio > 0.75) alpha = 1;
    else if (ratio > 0.5) alpha = 0.75;
    else if (ratio > 0.25) alpha = 0.5;
    else alpha = 0.25;
    
    let r = 37, g = 99, b = 235;
    if (colors.accent.startsWith('#')) {
      const hex = colors.accent.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }
    
    return {
      backgroundColor: \`rgba(\${r}, \${g}, \${b}, \${alpha})\`,
      opacity: isOutsideYear ? Math.max(alpha - 0.5, 0.1) : 1,
      borderWidth: '0px',
      borderRadius: '2px'
    };
  };`;

content = content.replace(oldIntensity, newIntensity);

// 3. Add Star Map right before Activity Matrix
const matrixHeader = `<h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Карта Созвездий</h3>`;
const matrixHeaderNew = `<h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Матрица Активности</h3>`;

content = content.replace(matrixHeader, matrixHeaderNew);

const fullMatrixOld = `{/* 1. Full Activity Matrix (Constellation Map) */}
      <section className="glass-panel p-6 md:p-10 rounded-[3.5rem] border border-theme-border shadow-sm overflow-hidden relative group hover:border-theme-accent/20 transition-all duration-500">`;

const fullMatrixNew = `{/* Star Map */}
      <section className="glass-panel p-6 md:p-10 rounded-[3.5rem] border border-theme-border shadow-sm overflow-hidden relative group hover:border-theme-accent/20 transition-all duration-500">
        <div className="mb-6 relative z-10">
          <h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Звездная Карта</h3>
          <p className="text-sm text-theme-muted font-medium opacity-60">Визуализация ваших сессий. Чем глубже фокус, тем ярче звезды.</p>
        </div>
        <div className="relative rounded-3xl overflow-hidden border border-theme-border shadow-inner">
          <FocusStarsCanvas sessions={sessions} />
        </div>
      </section>
      
      {/* 1. Full Activity Matrix (Constellation Map) */}
      <section className="glass-panel p-6 md:p-10 rounded-[3.5rem] border border-theme-border shadow-sm overflow-hidden relative group hover:border-theme-accent/20 transition-all duration-500">`;

content = content.replace(fullMatrixOld, fullMatrixNew);

fs.writeFileSync('src/components/Statistics.tsx', content);
console.log('Statistics updated');
