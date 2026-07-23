import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldFocus = `{focusTask && <FocusMode 
        task={focusTask} 
        onClose={handleEndFocus} 
        addFocusMinutes={addFocusMinutes} 
        recordSession={recordSession} 
        focusTrigger={focusTrigger}
        isPageVisible={isPageVisible}
      />}`;

const newFocus = `{focusTask && <FocusMode 
        task={focusTask} 
        onClose={handleEndFocus} 
        addFocusMinutes={addFocusMinutes} 
        recordSession={recordSession} 
        focusTrigger={focusTrigger}
        isPageVisible={isPageVisible}
        stats={stats}
      />}`;

content = content.replace(oldFocus, newFocus);
fs.writeFileSync('src/App.tsx', content);

