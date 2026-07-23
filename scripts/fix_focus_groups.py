import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

old_render = """                    <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
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

new_render = """                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from(new Set(sounds.map(s => (s as any).category || 'Остальное'))).map(category => (
                        <div key={category} className="mb-4">
                          <h4 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-2 pl-2">{category}</h4>
                          <div className="space-y-1">
                            {sounds.filter(s => ((s as any).category || 'Остальное') === category).map((s) => {
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
                          </div>
                        </div>
                      ))}
                    </div>"""

content = content.replace(old_render, new_render)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
