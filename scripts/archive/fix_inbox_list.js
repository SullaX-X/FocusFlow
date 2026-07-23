import fs from 'fs';
let content = fs.readFileSync('src/components/Inbox.tsx', 'utf8');

const listOld = `<List
                    height={300}
                    itemCount={items.length}
                    itemSize={90}
                    width="100%"
                    className="custom-scrollbar"
                  >
                    {((({ index, style }: any) => {
                      const item = items[index];
                      return (
                    <div style={style}>
                    <motion.div `;

const listNew = `<div className="custom-scrollbar overflow-y-auto" style={{ height: 300, width: "100%" }}>
                    <AnimatePresence>
                    {items.map((item, index) => (
                    <div key={item.id || index}>
                    <motion.div `;

content = content.replace(listOld, listNew);

const listEndOld = `                    </motion.div>
                    </div>
                      );
                    })) as any}
                  </List>`;

const listEndNew = `                    </motion.div>
                    </div>
                    ))}
                    </AnimatePresence>
                  </div>`;

content = content.replace(listEndOld, listEndNew);

// Remove the import
content = content.replace(/import \{ List \} from 'react-window';/g, "");

fs.writeFileSync('src/components/Inbox.tsx', content);
console.log("Fixed Inbox list");
