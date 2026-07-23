import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_prop = """        addFocusMinutes={(m) => {
          let discId = 'free';
          if (focusTask !== 'free') {
            for (const d of disciplines) {
              if (d.themes?.some(t => t.tasks.some(tsk => tsk.id === focusTask.id))) {
                discId = d.id;
                break;
              }
            }
          }
          addFocusMinutes(m, discId);
        }}"""

new_prop = """        addFocusMinutes={(m, isOvertime) => {
          let discId = 'free';
          if (focusTask !== 'free') {
            for (const d of disciplines) {
              if (d.themes?.some(t => t.tasks.some(tsk => tsk.id === focusTask.id))) {
                discId = d.id;
                break;
              }
            }
          }
          addFocusMinutes(m, discId, isOvertime);
        }}"""

content = content.replace(old_prop, new_prop)

with open('src/App.tsx', 'w') as f:
    f.write(content)
