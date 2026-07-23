import fs from 'fs';
let content = fs.readFileSync('src/components/Inbox.tsx', 'utf8');

const replacement = `            <div className="flex-1 overflow-hidden space-y-2 pr-1" style={{ height: '300px' }}>
              {isLocked ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-theme-bg rounded-full flex items-center justify-center mx-auto mb-4 text-theme-muted/30">
                       <span className="material-symbols-outlined text-4xl">lock</span>
                    </div>
                    <p className="text-theme-muted text-sm italic">Инбокс зашифрован. Разблокируйте в настройках.</p>
                  </motion.div>
              ) : items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-theme-bg rounded-full flex items-center justify-center mx-auto mb-4 text-theme-muted/30">
                       <span className="material-symbols-outlined text-4xl">inbox</span>
                    </div>
                    <p className="text-theme-muted text-sm italic">Инбокс пуст. Запишите сюда свои мысли.</p>
                  </motion.div>
                ) : (
                  <List
                    height={300}
                    itemCount={items.length}
                    itemSize={90}
                    width="100%"
                    className="custom-scrollbar"
                  >
                    {({ index, style }) => {
                      const item = items[index];
                      return (
                    <div style={style}>
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-3 p-4 rounded-2xl hover:bg-theme-bg/50 group transition-all border border-transparent hover:border-theme-border/50 h-[82px] mb-2 overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-lg bg-theme-bg flex items-center justify-center shrink-0 text-theme-muted group-hover:text-theme-accent transition-colors">
                        <span className="material-symbols-outlined text-lg">notes</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-theme-text truncate">{item.text}</p>
                        {item.metadata && (Object.keys(item.metadata).length > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 overflow-hidden h-6">
                            {item.metadata.date && (
                              <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                                <span className="material-symbols-outlined text-[12px]">event</span>
                                {item.metadata.date}
                              </span>
                            )}
                            {item.metadata.energy && (
                              <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                                <span className="material-symbols-outlined text-[12px]">bolt</span>
                                {item.metadata.energy}
                              </span>
                            )}
                            {item.metadata.category && (
                              <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                                <span className="material-symbols-outlined text-[12px]">folder</span>
                                {item.metadata.category}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-theme-muted hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </motion.div>
                    </div>
                  )}}
                  </List>
                )}
            </div>`;

content = content.replace(/<div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">[\s\S]*?<\/AnimatePresence>\n            <\/div>/, replacement);
fs.writeFileSync('src/components/Inbox.tsx', content);
