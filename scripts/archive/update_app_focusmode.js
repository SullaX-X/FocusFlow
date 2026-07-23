import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /<FocusMode\s+task=\{focusTask\}\s+onClose=\{handleEndFocus\}\s+addFocusMinutes=\{addFocusMinutes\}\s+recordSession=\{recordSession\}\s+focusTrigger=\{focusTrigger\}\s+isPageVisible=\{isPageVisible\}\s+\/>/g,
  '<FocusMode task={focusTask} onClose={handleEndFocus} addFocusMinutes={addFocusMinutes} recordSession={recordSession} focusTrigger={focusTrigger} isPageVisible={isPageVisible} stats={stats} />'
);
fs.writeFileSync('src/App.tsx', content);

