import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const newSvg = `<svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30" className="text-yellow-500">
                    <path d="M11,2L5.5,5.9L6.5,7.3L11,4.1V2M13,2V4.1L17.5,7.3L18.5,5.9L13,2M11,5.2L4.6,9.7L11,11V5.2M13,5.2V11L19.4,9.7L13,5.2M2.5,10.4L2,11.8L11,12.9V14.5L1.4,14.2L1.3,15.7L11,16V17.5L2.6,18.4L2.7,20L11,19V22H13V19L21.3,20L21.4,18.4L13,17.5V16L22.7,15.7L22.6,14.2L13,14.5V12.9L22,11.8L21.5,10.4L13,12V6.2L11,6.2V12L2.5,10.4M11,13L4.9,12.3L4.1,13.8L11,14.6V13M13,13V14.6L19.9,13.8L19.1,12.3L13,13M11,15L3.6,14.8L3.5,16.3L11,16.5V15M13,15V16.5L20.5,16.3L20.4,14.8L13,15M11,16.9L4.4,17.6L4.6,19.1L11,18.4V16.9M13,16.9V18.4L19.4,19.1L19.6,17.6L13,16.9Z" />
                  </svg>`;

content = content.replace(/<svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30" className="text-yellow-500">[\s\S]*?<\/svg>/, newSvg);

fs.writeFileSync('src/components/Profile.tsx', content);
