import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const newSvg = `<svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30" className="text-yellow-500">
                    <path d="M13,8.5V4H11V8.5C9.75,8.81 8.84,9.81 8.57,11H5.82L3.41,8.59L2,10L4.59,12.59C4.16,12.91 3.5,13 3.5,13H2V15H3.5C3.5,15 4.39,15.22 5.09,16L2,19.09L3.41,20.5L6.5,17.41C7.11,18.03 8,18.5 9,18.78V22H11V19C11,19 11.41,19 12,19C12.59,19 13,19 13,19V22H15V18.78C16,18.5 16.89,18.03 17.5,17.41L20.59,20.5L22,19.09L18.91,16C19.61,15.22 20.5,15 20.5,15H22V13H20.5C20.5,13 19.84,12.91 19.41,12.59L22,10L20.59,8.59L18.18,11H15.43C15.16,9.81 14.25,8.81 13,8.5M12,11A2,2 0 0,1 14,13A2,2 0 0,1 12,15A2,2 0 0,1 10,13A2,2 0 0,1 12,11Z" />
                  </svg>`;

content = content.replace(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[\s\S]*?<\/svg>/, newSvg);

fs.writeFileSync('src/components/Profile.tsx', content);
