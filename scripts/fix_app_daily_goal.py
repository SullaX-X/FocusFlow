import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add updateDailyGoal
old_goals = """  const updateWeeklyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, weeklyGoal: goal }));
  };"""

new_goals = """  const updateWeeklyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, weeklyGoal: goal }));
  };

  const updateDailyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, dailyGoal: goal }));
  };"""
content = content.replace(old_goals, new_goals)

# Update Dashboard props in App.tsx
old_dash = "{activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} stats={stats} updateWeeklyGoal={updateWeeklyGoal} addDiscipline={addDiscipline} />}"
new_dash = "{activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} stats={stats} updateWeeklyGoal={updateWeeklyGoal} updateDailyGoal={updateDailyGoal} addDiscipline={addDiscipline} />}"
content = content.replace(old_dash, new_dash)

# We should also pass focusDust update method if they claim the bonus dust! 
# Let's add claimBonusDust
old_goals_v2 = """  const updateDailyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, dailyGoal: goal }));
  };"""

new_goals_v2 = """  const updateDailyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, dailyGoal: goal }));
  };

  const claimBonusDust = (amount: number) => {
    setStats((prev: any) => ({ ...prev, focusDust: (prev.focusDust || 0) + amount }));
  };"""
content = content.replace(old_goals_v2, new_goals_v2)

# Update Dashboard props again
old_dash_v2 = "{activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} stats={stats} updateWeeklyGoal={updateWeeklyGoal} updateDailyGoal={updateDailyGoal} addDiscipline={addDiscipline} />}"
new_dash_v2 = "{activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} stats={stats} updateWeeklyGoal={updateWeeklyGoal} updateDailyGoal={updateDailyGoal} claimBonusDust={claimBonusDust} addDiscipline={addDiscipline} />}"
content = content.replace(old_dash_v2, new_dash_v2)

with open('src/App.tsx', 'w') as f:
    f.write(content)
