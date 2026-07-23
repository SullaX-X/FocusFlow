import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

notif_str = """      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Время вышло!", { body: "Пора сделать перерыв или продолжить работу." });
      }
"""

# Insert after setIsOvertime(true);
content = content.replace("setIsOvertime(true);", "setIsOvertime(true);\n" + notif_str)

# Also when toggling active, request permission
toggle_re = r"""onClick=\{\(\) => setIsActive\(!isActive\)\}"""
toggle_repl = """onClick={() => {
                        setIsActive(!isActive);
                        if (!isActive && "Notification" in window && Notification.permission === "default") {
                          Notification.requestPermission();
                        }
                      }}"""
content = re.sub(toggle_re, toggle_repl, content)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)

