import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Fix suggested task title
old_suggested_title = '<h2 className="text-2xl md:text-3xl font-bold mb-1">{suggestedTask.task.title}</h2>'
new_suggested_title = '<h2 className="text-2xl md:text-3xl font-bold mb-1 truncate w-full" title={suggestedTask.task.title}>{suggestedTask.task.title}</h2>'
content = content.replace(old_suggested_title, new_suggested_title)

# Fix suggested task desc
old_suggested_desc = '<p className="text-white/80 max-w-lg">{suggestedTask.task.description}</p>'
new_suggested_desc = '<p className="text-white/80 max-w-lg truncate w-full" title={suggestedTask.task.description}>{suggestedTask.task.description}</p>'
content = content.replace(old_suggested_desc, new_suggested_desc)

# Fix discipline names
old_dname = """                <h3 className={`font-bold text-2xl leading-tight mb-6 transition-colors ${isDone ? 'text-theme-muted line-through' : 'text-theme-text'}`}>
                  {d.name}
                </h3>"""
new_dname = """                <h3 className={`font-bold text-2xl leading-tight mb-6 transition-colors truncate w-full ${isDone ? 'text-theme-muted line-through' : 'text-theme-text'}`} title={d.name}>
                  {d.name}
                </h3>"""
content = content.replace(old_dname, new_dname)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

with open('src/components/Disciplines.tsx', 'r') as f:
    content = f.read()

# Fix discipline name
old_dname2 = '<h3 className="text-lg md:text-xl font-bold text-theme-text">{d.name}</h3>'
new_dname2 = '<h3 className="text-lg md:text-xl font-bold text-theme-text truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px]" title={d.name}>{d.name}</h3>'
content = content.replace(old_dname2, new_dname2)

# Fix task name inside theme list
old_tname = """                    <span className={`text-sm ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-theme-text'}`}>
                      {task.title}
                    </span>"""
new_tname = """                    <span className={`text-sm truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-theme-text'}`} title={task.title}>
                      {task.title}
                    </span>"""
content = content.replace(old_tname, new_tname)

with open('src/components/Disciplines.tsx', 'w') as f:
    f.write(content)
