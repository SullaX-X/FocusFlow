function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const currentYear = 2026;
const start = new Date(currentYear, 0, 1);
const dayOfWeek = start.getDay();
const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
start.setDate(start.getDate() - diffToMonday);

console.log(start.toString());

const dDate = new Date(start);
for (let i = 0; i < 7; i++) {
  console.log(formatDate(dDate), dDate.getDay());
  dDate.setDate(dDate.getDate() + 1);
}
