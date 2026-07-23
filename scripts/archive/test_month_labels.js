const weeks = [];
const currentYear = 2026;
const start = new Date(currentYear, 0, 1);
const dayOfWeek = start.getDay();
const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
start.setDate(start.getDate() - diffToMonday);

let dDate = new Date(start);
for (let i = 0; i < 53 * 7; i++) {
  if (i % 7 === 0) weeks.push([]);
  weeks[weeks.length - 1].push({
    date: new Date(dDate),
    month: dDate.getMonth(),
    isOutsideYear: dDate.getFullYear() !== currentYear
  });
  dDate.setDate(dDate.getDate() + 1);
}

const labels = [];
let lastMonth = -1;
const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
weeks.forEach((week, index) => {
  // Let's find the first day that is IN the current year in this week, or just the first day
  const validDay = week.find(d => !d.isOutsideYear) || week[0];
  if (validDay && validDay.month !== lastMonth && !validDay.isOutsideYear) {
    labels.push({
      index,
      label: monthNames[validDay.month]
    });
    lastMonth = validDay.month;
  }
});
console.log(labels);
