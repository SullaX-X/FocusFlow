import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const monthOld = `    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (firstDay && firstDay.month !== lastMonth && !firstDay.isOutsideYear) {
        const date = new Date(firstDay.date);
        labels.push({
          index,
          label: date.toLocaleString('ru-RU', { month: 'short' })
        });
        lastMonth = firstDay.month;
      }
    });`;

const monthNew = `    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (firstDay && firstDay.month !== lastMonth && !firstDay.isOutsideYear) {
        labels.push({
          index,
          label: monthNames[firstDay.month]
        });
        lastMonth = firstDay.month;
      }
    });`;

content = content.replace(monthOld, monthNew);
fs.writeFileSync('src/components/Statistics.tsx', content);
