import fs from 'fs';

const file = 'src/components/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `                      onClick={() => {
                        toggleSound(sound.id);
                        if (isLocked && !activeSounds[sound.id]?.isPlaying) setConfirmSound(sound.id);
                      }}
                      className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all \${activeSounds[sound.id]?.isPlaying ? 'bg-theme-accent text-text-on-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.4)]' : 'bg-theme-text/10 text-theme-muted hover:bg-theme-text/20'}\`}
                      title={isLocked ? 'Купить' : 'Слушать'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {activeSounds[sound.id]?.isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>`;

const replacement1 = `                      onClick={() => {
                        if (isLocked) {
                          if (!activeSounds[sound.id]?.isPlaying) setConfirmSound(sound.id);
                        } else {
                          toggleSound(sound.id);
                        }
                      }}
                      className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all \${activeSounds[sound.id]?.isPlaying ? 'bg-theme-accent text-text-on-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.4)]' : 'bg-theme-text/10 text-theme-muted hover:bg-theme-text/20'}\`}
                      title={isLocked ? 'Купить' : 'Слушать'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isLocked ? 'lock' : (activeSounds[sound.id]?.isPlaying ? 'pause' : 'play_arrow')}
                      </span>
                    </button>`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  fs.writeFileSync(file, content);
  console.log("Replaced onClick handlers successfully.");
} else {
  console.log("Could not find targets in Settings!");
}
