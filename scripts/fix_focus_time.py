import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# I will add a applyTimeChange function at the top level of the component
apply_func = """  const applyTimeChange = (m: number) => {
    if (m > 1440) m = 1440;
    if (m === 3120) m = 30;
    setTotalTime(m * 60);
    setTimeLeft(m * 60);
    setIsOvertime(false);
    setIsActive(true);
    setSessionMode('focus');
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

"""

# find applyModeChange and insert above it
idx = content.find("  const applyModeChange")
if idx != -1:
    content = content[:idx] + apply_func + content[idx:]

# Now replace the time inputs:
# 1) onBlur in input
blur_re = r"""onBlur=\{\(\) => \{
                      let m = parseInt\(timeInput, 10\);
                      if \(!isNaN\(m\) && m > 0\) \{
                        if \(m > 1440\) m = 1440; // cap at 24 hours
                        if \(m === 3120\) m = 30; // user requested fix for 3120 turning into 30
                        setTimeLeft\(m \* 60\);
                        setTotalTime\(m \* 60\);
                      \}
                      setIsEditingTime\(false\);
                    \}\}"""

blur_repl = """onBlur={() => {
                      let m = parseInt(timeInput, 10);
                      if (!isNaN(m) && m > 0) {
                        applyTimeChange(m);
                      }
                      setIsEditingTime(false);
                    }}"""
content = re.sub(blur_re, blur_repl, content)

# 2) onKeyDown in input
key_re = r"""onKeyDown=\{\(e\) => \{
                      if \(e\.key === "Enter"\) \{
                        let m = parseInt\(timeInput, 10\);
                        if \(!isNaN\(m\) && m > 0\) \{
                          if \(m > 1440\) m = 1440;
                          if \(m === 3120\) m = 30; // user requested fix
                          setTimeLeft\(m \* 60\);
                          setTotalTime\(m \* 60\);
                        \}
                        setIsEditingTime\(false\);
                      \} else if \(e\.key === "Escape"\) \{
                        setIsEditingTime\(false\);
                      \}
                    \}\}"""

key_repl = """onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        let m = parseInt(timeInput, 10);
                        if (!isNaN(m) && m > 0) {
                          applyTimeChange(m);
                        }
                        setIsEditingTime(false);
                      } else if (e.key === "Escape") {
                        setIsEditingTime(false);
                      }
                    }}"""
content = re.sub(key_re, key_repl, content)

# 3) Presets onClick
preset_re = r"""onClick=\{\(\) => \{
                          setTimeLeft\(m \* 60\);
                          setTotalTime\(m \* 60\);
                        \}\}"""

preset_repl = """onClick={() => {
                          applyTimeChange(m);
                        }}"""
content = re.sub(preset_re, preset_repl, content)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
