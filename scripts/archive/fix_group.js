import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// Change group to group/cell on the cell div
content = content.replace(
  'className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group cursor-pointer ${day.isOutsideYear ? \'opacity-30\' : \'\'}`}',
  'className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group/cell cursor-pointer ${day.isOutsideYear ? \'opacity-30\' : \'\'}`}'
);

// Change group-hover:opacity-100 to group-hover/cell:opacity-100 on the tooltip
content = content.replace(
  'rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none',
  'rounded-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none'
);

fs.writeFileSync('src/components/Statistics.tsx', content);
