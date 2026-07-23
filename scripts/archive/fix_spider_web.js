import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const newIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                    <path d="M12 2v20"/>
                    <path d="M2 12h20"/>
                    <path d="m4.9 4.9 14.2 14.2"/>
                    <path d="m4.9 19.1 14.2-14.2"/>
                    <path d="M12 6c-3.3 0-6 2.7-6 6"/>
                    <path d="M12 6c3.3 0 6 2.7 6 6"/>
                    <path d="M12 18c-3.3 0-6-2.7-6-6"/>
                    <path d="M12 18c3.3 0 6-2.7 6-6"/>
                    <path d="M12 9c-1.7 0-3 1.3-3 3"/>
                    <path d="M12 9c1.7 0 3 1.3 3 3"/>
                    <path d="M12 15c-1.7 0-3-1.3-3-3"/>
                    <path d="M12 15c1.7 0 3-1.3 3-3"/>
                  </svg>`;

content = content.replace(/<span className="text-3xl leading-none" role="img" aria-label="spider">🕷️<\/span>/, newIcon);

fs.writeFileSync('src/components/Profile.tsx', content);
