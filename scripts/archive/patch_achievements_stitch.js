import fs from 'fs';

let content = fs.readFileSync('src/achievementsData.ts', 'utf8');

const newAchievements = `  { id: 'stitch_capsule', title: 'Эксперимент 626', desc: 'Создание гения (626 пыльцы)', type: 'focusDust', max: 626, img: '/achievements/stitch/capsule.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Стич' },
  { id: 'stitch_flower', title: 'Охана', desc: 'Семья значит никто не забыт (15 активных дней)', type: 'activeDays', max: 15, img: '/achievements/stitch/flower.svg', rarity: 'Epic', color: '#a855f7', collection: 'Стич' },
  { id: 'stitch_hand', title: 'Дай Пять', desc: 'Инопланетный друг (1500 минут)', type: 'totalMinutes', max: 1500, img: '/achievements/stitch/hand.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Стич' },
  { id: 'stitch_camera', title: 'Щелчок', desc: 'Сохранить момент (21 активный день)', type: 'activeDays', max: 21, img: '/achievements/stitch/camera.svg', rarity: 'Epic', color: '#a855f7', collection: 'Стич' },
  { id: 'stitch_star', title: 'Звездный Серфер', desc: 'Космическое путешествие (2000 пыльцы)', type: 'focusDust', max: 2000, img: '/achievements/stitch/star.svg', rarity: 'Legendary', color: '#eab308', collection: 'Стич' }
];`;

content = content.replace(/\];/, ",\n" + newAchievements);

fs.writeFileSync('src/achievementsData.ts', content);
