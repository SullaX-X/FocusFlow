import re
with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# We need to add the `setSoundWaveform` to useGlobalAudio inside FocusMode
content = content.replace(
    'const { activeSounds, toggleSound, setSoundVolume, stopAll } = useGlobalAudio();',
    'const { activeSounds, toggleSound, setSoundVolume, setSoundWaveform, stopAll } = useGlobalAudio();'
)

# And inside the audio rendering list, let's inject waveform selector and warning if applicable.
old_render = """                            <AnimatePresence>
                              {isActive && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="pl-7 pr-2"
                                >
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={activeSounds[s.id]?.volume ?? 0.5}
                                    onChange={(e) => setSoundVolume(s.id, Number(e.target.value))}
                                    className="w-full accent-theme-accent h-1 bg-theme-border rounded-lg appearance-none cursor-pointer"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>"""

new_render = """                            <AnimatePresence>
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
                            </AnimatePresence>"""

content = content.replace(old_render, new_render)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
