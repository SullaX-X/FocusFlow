import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# Let's replace the list of sounds with grouped categories
old_ui = """                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {sounds.map((s) => {
                        const isActive = activeSounds[s.id]?.isPlaying;
                        return (
                          <div key={s.id} className={`p-2 rounded-lg border transition-colors ${isActive ? 'bg-theme-accent/5 border-theme-accent/20' : 'bg-transparent border-transparent'}`}>
                            <button
                              onClick={() => toggleSound(s.id)}
                              className="w-full text-left flex items-center gap-2 mb-2"
                            >
                              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-theme-accent' : 'text-theme-muted'}`}>
                                {isActive ? "pause_circle" : "play_circle"}
                              </span>
                              <span className={`text-sm ${isActive ? 'text-theme-accent font-medium' : 'text-theme-text'}`}>{s.name}</span>
                            </button>
                            
                            <AnimatePresence>
                              {isActive && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="pl-7 pr-2 flex flex-col gap-2"
                                >
                                  {(s as any).warning && (
                                    <p className="text-[10px] text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20 leading-tight">
                                      {(s as any).warning}
                                    </p>
                                  )}
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={activeSounds[s.id]?.volume ?? 0.5}
                                    onChange={(e) => setSoundVolume(s.id, Number(e.target.value))}
                                    className="w-full accent-theme-accent h-1 bg-theme-border rounded-lg appearance-none cursor-pointer mb-1"
                                  />
                                  {s.id === 'full_sweep' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <label className="text-xs text-theme-muted">Волна:</label>
                                      <select 
                                        value={activeSounds[s.id]?.waveform || 'sine'}
                                        onChange={(e) => setSoundWaveform(s.id, e.target.value as any)}
                                        className="bg-theme-bg border border-theme-border rounded text-xs px-2 py-1 text-theme-text outline-none focus:border-theme-accent flex-1"
                                      >
                                        <option value="sine">Sine</option>
                                        <option value="square">Square</option>
                                        <option value="sawtooth">Sawtooth</option>
                                        <option value="triangle">Triangle</option>
                                      </select>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>"""

new_ui = """                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1 pb-2">
                      {Array.from(new Set(sounds.map(s => s.category))).map(category => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider px-2">{category}</h4>
                          <div className="space-y-1">
                            {sounds.filter(s => s.category === category).map((s) => {
                              const isActive = activeSounds[s.id]?.isPlaying;
                              return (
                                <div key={s.id} className={`p-2 rounded-xl transition-all border ${isActive ? 'bg-theme-accent/10 border-theme-accent/30 shadow-sm' : 'bg-transparent border-transparent hover:bg-theme-card-hover'}`}>
                                  <button
                                    onClick={() => toggleSound(s.id)}
                                    className="w-full text-left flex items-center gap-3"
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-theme-accent text-white shadow-md' : 'bg-theme-bg border border-theme-border text-theme-muted group-hover:border-theme-accent/50'}`}>
                                      <span className="material-symbols-outlined text-[18px]">
                                        {isActive ? "pause" : "play_arrow"}
                                      </span>
                                    </div>
                                    <span className={`text-sm flex-1 ${isActive ? 'text-theme-accent font-semibold' : 'text-theme-text'}`}>{s.name}</span>
                                    {isActive && (
                                      <div className="flex gap-[2px] h-4 items-end">
                                        <div className="w-1 bg-theme-accent animate-[pulse_1s_ease-in-out_infinite] rounded-t-sm" style={{height: '40%'}}></div>
                                        <div className="w-1 bg-theme-accent animate-[pulse_1s_ease-in-out_infinite_0.2s] rounded-t-sm" style={{height: '100%'}}></div>
                                        <div className="w-1 bg-theme-accent animate-[pulse_1s_ease-in-out_infinite_0.4s] rounded-t-sm" style={{height: '60%'}}></div>
                                      </div>
                                    )}
                                  </button>
                                  
                                  <AnimatePresence>
                                    {isActive && (
                                      <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="pl-11 pr-2 flex flex-col gap-2 mt-3 overflow-hidden"
                                      >
                                        {(s as any).warning && (
                                          <p className="text-[10px] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20 leading-tight flex items-start gap-1">
                                            <span className="material-symbols-outlined text-[12px] shrink-0 mt-0.5">warning</span>
                                            <span>{(s as any).warning}</span>
                                          </p>
                                        )}
                                        <div className="flex items-center gap-3">
                                          <span className="material-symbols-outlined text-theme-muted text-[16px]">volume_down</span>
                                          <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={activeSounds[s.id]?.volume ?? 0.5}
                                            onChange={(e) => setSoundVolume(s.id, Number(e.target.value))}
                                            className="w-full accent-theme-accent h-1.5 bg-theme-border rounded-full appearance-none cursor-pointer"
                                          />
                                          <span className="material-symbols-outlined text-theme-muted text-[16px]">volume_up</span>
                                        </div>
                                        {s.id === 'full_sweep' && (
                                          <div className="flex items-center gap-2 mt-2 bg-theme-bg p-2 rounded-lg border border-theme-border">
                                            <label className="text-xs text-theme-muted font-medium">Форма волны:</label>
                                            <select 
                                              value={activeSounds[s.id]?.waveform || 'sine'}
                                              onChange={(e) => setSoundWaveform(s.id, e.target.value as any)}
                                              className="bg-transparent border-none text-xs text-theme-text outline-none font-medium flex-1 text-right cursor-pointer"
                                            >
                                              <option value="sine">Sine</option>
                                              <option value="square">Square</option>
                                              <option value="sawtooth">Sawtooth</option>
                                              <option value="triangle">Triangle</option>
                                            </select>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>"""

if old_ui in content:
    content = content.replace(old_ui, new_ui)
    
    # Also make the popup slightly wider and adjust the header
    old_header = """className="absolute top-full right-0 mt-2 w-64 bg-theme-card border border-theme-border rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right\""""
    new_header = """className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right\""""
    content = content.replace(old_header, new_header)
    
    with open('src/components/FocusMode.tsx', 'w') as f:
        f.write(content)
    print("Replaced UI in FocusMode.tsx")
else:
    print("Could not find old UI in FocusMode.tsx")
