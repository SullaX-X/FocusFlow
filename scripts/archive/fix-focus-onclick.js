import fs from 'fs';

const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `                                    <button
                                      onClick={() => {
                                        toggleSound(s.id);
                                        if (isLocked && !isActive) setConfirmSound(s.id);
                                      }}
                                      className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0 \${isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-bg group-hover:bg-theme-accent/10 text-theme-muted group-hover:text-theme-accent'}\`}
                                      title={isLocked ? 'Купить' : 'Слушать'}
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl transition-colors">
                                        {isActive ? 'pause' : 'play_arrow'}
                                      </span>
                                    </button>`;

const replacement1 = `                                    <button
                                      onClick={() => {
                                        if (isLocked) {
                                          if (!isActive) setConfirmSound(s.id);
                                        } else {
                                          toggleSound(s.id);
                                        }
                                      }}
                                      className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0 \${isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-bg group-hover:bg-theme-accent/10 text-theme-muted group-hover:text-theme-accent'}\`}
                                      title={isLocked ? 'Купить' : 'Слушать'}
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl transition-colors">
                                        {isLocked ? 'lock' : (isActive ? 'pause' : 'play_arrow')}
                                      </span>
                                    </button>`;

const target2 = `                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                                      toggleSound(s.id);
                                      if (isLocked && !isActive) setConfirmSound(s.id);
                                    }}>`;

const replacement2 = `                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                                      if (isLocked) {
                                        if (!isActive) setConfirmSound(s.id);
                                      } else {
                                        toggleSound(s.id);
                                      }
                                    }}>`;

if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replacement1).replace(target2, replacement2);
  fs.writeFileSync(file, content);
  console.log("Replaced onClick handlers successfully.");
} else {
  console.log("Could not find targets in FocusMode!");
}
