import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_func = """  const addFocusMinutes = (minutes: number, disciplineId: string | 'free') => {
    setStats((prev: any) => {
      const today = new Date().toISOString().split('T')[0];
      return {
        ...prev,
        focusDust: (prev.focusDust || 0) + minutes,
        dailyMinutes: {
          ...prev.dailyMinutes,
          [today]: (prev.dailyMinutes?.[today] || 0) + minutes
        },
        disciplineMinutes: {
          ...prev.disciplineMinutes,
          [disciplineId]: (prev.disciplineMinutes?.[disciplineId] || 0) + minutes
        }
      };
    });
  };"""

new_func = """  const addFocusMinutes = (minutes: number, disciplineId: string | 'free', isOvertime: boolean = false) => {
    setStats((prev: any) => {
      const today = new Date().toISOString().split('T')[0];
      const dustGained = isOvertime ? minutes * 2 : minutes; // Double dust for overtime!
      return {
        ...prev,
        focusDust: (prev.focusDust || 0) + dustGained,
        dailyMinutes: {
          ...prev.dailyMinutes,
          [today]: (prev.dailyMinutes?.[today] || 0) + minutes
        },
        disciplineMinutes: {
          ...prev.disciplineMinutes,
          [disciplineId]: (prev.disciplineMinutes?.[disciplineId] || 0) + minutes
        }
      };
    });
  };"""

content = content.replace(old_func, new_func)

with open('src/App.tsx', 'w') as f:
    f.write(content)
