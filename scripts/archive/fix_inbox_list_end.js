import fs from 'fs';
let content = fs.readFileSync('src/components/Inbox.tsx', 'utf8');

const endOld = `                      </button>
                    </motion.div>
                    </div>
                      );
                    }) as any)}
                  </List>`;

const endNew = `                      </button>
                    </motion.div>
                    </div>
                    ))}
                    </AnimatePresence>
                  </div>`;

content = content.replace(endOld, endNew);

fs.writeFileSync('src/components/Inbox.tsx', content);
console.log("Fixed Inbox list end");
