import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const replacement = `{ach.icon === 'spider' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                    <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 22a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
                    <path d="M9.5 9 4 7" />
                    <path d="M14.5 9 20 7" />
                    <path d="M9 13.5 2 12" />
                    <path d="M15 13.5 22 12" />
                    <path d="M8.5 17.5 3 21" />
                    <path d="M15.5 17.5 21 21" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-3xl text-yellow-500">{ach.icon}</span>
                )}`;

content = content.replace('<span className="material-symbols-outlined text-3xl text-yellow-500">{ach.icon}</span>', replacement);

fs.writeFileSync('src/components/Profile.tsx', content);
