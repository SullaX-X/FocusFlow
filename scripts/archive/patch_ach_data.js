import fs from 'fs';

let content = fs.readFileSync('src/achievementsData.ts', 'utf8');
content = content.replace(/'\/achievements\/prince\/fox.svg', rarity: 'Common', color: '#94a3b8' },/g, "'/achievements/prince/fox.svg', rarity: 'Common', color: '#94a3b8', collection: 'Маленький Принц' },");
content = content.replace(/'\/achievements\/prince\/rose.svg', rarity: 'Common', color: '#94a3b8' },/g, "'/achievements/prince/rose.svg', rarity: 'Common', color: '#94a3b8', collection: 'Маленький Принц' },");
content = content.replace(/'\/achievements\/prince\/king.svg', rarity: 'Rare', color: '#38bdf8' },/g, "'/achievements/prince/king.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Маленький Принц' },");
content = content.replace(/'\/achievements\/prince\/scarf.svg', rarity: 'Rare', color: '#38bdf8' },/g, "'/achievements/prince/scarf.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Маленький Принц' },");
content = content.replace(/'\/achievements\/prince\/topor.svg', rarity: 'Epic', color: '#a855f7' },/g, "'/achievements/prince/topor.svg', rarity: 'Epic', color: '#a855f7', collection: 'Маленький Принц' },");
content = content.replace(/'\/achievements\/prince\/vulkan.svg', rarity: 'Legendary', color: '#eab308' },/g, "'/achievements/prince/vulkan.svg', rarity: 'Legendary', color: '#eab308', collection: 'Маленький Принц' },");

content = content.replace(/'\/achievements\/spider\/house.svg', rarity: 'Common', color: '#94a3b8' },/g, "'/achievements/spider/house.svg', rarity: 'Common', color: '#94a3b8', collection: 'Человек-Паук' },");
content = content.replace(/'\/achievements\/spider\/portal_colorful.svg', rarity: 'Rare', color: '#38bdf8' },/g, "'/achievements/spider/portal_colorful.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Человек-Паук' },");
content = content.replace(/'\/achievements\/spider\/power.svg', rarity: 'Epic', color: '#a855f7' },/g, "'/achievements/spider/power.svg', rarity: 'Epic', color: '#a855f7', collection: 'Человек-Паук' },");
content = content.replace(/'\/achievements\/spider\/spider_mine.svg', rarity: 'Legendary', color: '#eab308' },/g, "'/achievements/spider/spider_mine.svg', rarity: 'Legendary', color: '#eab308', collection: 'Человек-Паук' },");
content = content.replace(/'\/achievements\/spider\/wight.svg', rarity: 'Mythic', color: '#ef4444' },/g, "'/achievements/spider/wight.svg', rarity: 'Mythic', color: '#ef4444', collection: 'Человек-Паук' },");
content = content.replace(/'\/achievements\/spider\/spider.svg', rarity: 'Mythic', color: '#ef4444' }/g, "'/achievements/spider/spider.svg', rarity: 'Mythic', color: '#ef4444', collection: 'Человек-Паук' }");

fs.writeFileSync('src/achievementsData.ts', content);
