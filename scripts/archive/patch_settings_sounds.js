import fs from 'fs';

let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const soundRenderOld = /{sounds\.map\(sound => \([\s\S]*?<\/div>\s*\)\)}/;

const soundRenderNew = `{sounds.map(sound => {
              const isLocked = sound.dustRequired && (stats?.focusDust || 0) < sound.dustRequired;
              
              return (
              <div key={sound.id} className={\`flex flex-col gap-3 p-4 rounded-xl border transition-all \${isLocked ? 'bg-theme-text/5 border-transparent opacity-70 grayscale' : 'bg-theme-text/2 border-theme-text/5 hover:bg-theme-text/5'}\`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (isLocked) {
                          alert(\`Требуется \${sound.dustRequired} ✨ звездной пыльцы\`);
                          return;
                        }
                        toggleSound(sound.id);
                      }}
                      className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all \${activeSounds[sound.id]?.isPlaying ? 'bg-theme-accent text-text-on-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.4)]' : 'bg-theme-text/10 text-theme-muted'}\`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isLocked ? 'lock' : (activeSounds[sound.id]?.isPlaying ? 'pause' : 'play_arrow')}
                      </span>
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold">{sound.name}</p>
                        {sound.dustRequired && (
                           <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded-full \${isLocked ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-text/10 text-theme-muted'}\`}>
                             {sound.dustRequired} ✨
                           </span>
                        )}
                      </div>
                      <p className="text-[9px] text-theme-muted uppercase tracking-widest">{sound.category}</p>
                    </div>
                  </div>
                  {!isLocked && activeSounds[sound.id]?.isPlaying && (
                    <div className="flex items-center gap-2 flex-1 max-w-[120px] sm:max-w-[150px]">
                      <span className="material-symbols-outlined text-[14px] text-theme-muted">volume_down</span>
                      <input 
                        type="range" 
                        min="0" max="1" step="0.01"
                        value={activeSounds[sound.id].volume}
                        onChange={(e) => setSoundVolume(sound.id, parseFloat(e.target.value))}
                        className="w-full accent-theme-accent"
                      />
                    </div>
                  )}
                </div>
                {sound.warning && !isLocked && (
                  <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px]">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>{sound.warning}</span>
                  </div>
                )}
              </div>
            )
            })}`;

content = content.replace(soundRenderOld, soundRenderNew);
fs.writeFileSync('src/components/Settings.tsx', content);

