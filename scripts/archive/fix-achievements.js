import fs from 'fs';

const achievements = [
  // Ветка 1: Маленький Принц (Le Petit Prince)
  { id: 'rose_01', title: 'Единственная Роза', desc: 'Забота о главном (60000 пыльцы)', type: 'focusDust', max: 60000, img: '/achievements/prince/rose.svg', rarity: 'Mythic', color: '#ef4444', collection: 'Маленький Принц', lore: 'Ты в ответе за тех, кого приручил. Твоя дисциплина — это цветок, который завянет без ежедневной заботы.' },
  { id: 'vulkan_01', title: 'Обитатель B-612', desc: 'Ежедневный труд (180 активных дней)', type: 'activeDays', max: 180, img: '/achievements/prince/vulkan.svg', rarity: 'Legendary', color: '#eab308', collection: 'Маленький Принц', lore: 'Твой дом — крошечный астероид. Чтобы он не разрушился, нужно каждое утро приводить его в порядок.' },
  { id: 'topor_01', title: 'Охотник на Баобабов', desc: 'Искоренить лень (30000 минут)', type: 'totalMinutes', max: 30000, img: '/achievements/prince/topor.svg', rarity: 'Legendary', color: '#eab308', collection: 'Маленький Принц', lore: 'Сорняки нужно вырывать сразу, пока они не разорвали твою планету. Маленькие вредные привычки губят большие цели.' },
  { id: 'fox_01', title: 'Друг Лиса', desc: 'Приручить Фокус (3 активных дня)', type: 'activeDays', max: 3, img: '/achievements/prince/fox.svg', rarity: 'Common', color: '#94a3b8', collection: 'Маленький Принц', lore: 'Фокус — это процесс приручения. Чтобы создать связи, нужно набраться терпения и каждый день садиться чуть ближе к цели.' },
  { id: 'king_01', title: 'Король Астероидов', desc: 'Власть над временем (1000 минут)', type: 'totalMinutes', max: 1000, img: '/achievements/prince/king.svg', rarity: 'Common', color: '#94a3b8', collection: 'Маленький Принц', lore: 'Власть должна быть разумной. Ты повелеваешь своим временем, но только тогда, когда отдаешь себе выполнимые приказы.' },
  { id: 'scarf_01', title: 'Маленький Принц', desc: 'Укрытие от ветра (100 активных дней)', type: 'activeDays', max: 100, img: '/achievements/prince/scarf.svg', rarity: 'Epic', color: '#a855f7', collection: 'Маленький Принц', lore: 'Ты сохранил чистоту восприятия. Самого главного глазами не увидишь — зорко одно лишь сердце.' },

  // Ветка 2: Человек-Паук (Spider-Man)
  { id: 'spider_mine_01', title: 'Дружелюбный сосед', desc: 'Технологии (500 пыльцы)', type: 'focusDust', max: 500, img: '/achievements/spider/spider_mine.svg', rarity: 'Common', color: '#94a3b8', collection: 'Человек-Паук', lore: 'Первый шаг в освоении способностей. Маленькая победа на своей улице ведет к большим свершениям.' },
  { id: 'house_01', title: 'Паучье чутье', desc: 'Безопасное место (15000 пыльцы)', type: 'focusDust', max: 15000, img: '/achievements/spider/house.svg', rarity: 'Epic', color: '#a855f7', collection: 'Человек-Паук', lore: 'Твой разум предупреждает об отвлечениях. Игнорируй шум города, чувствуй только то, что важно прямо сейчас.' },
  { id: 'power_01', title: 'Великая сила', desc: 'Большая ответственность (10000 минут)', type: 'totalMinutes', max: 10000, img: '/achievements/spider/power.svg', rarity: 'Epic', color: '#a855f7', collection: 'Человек-Паук', lore: 'С большой силой приходит большая ответственность. Твой интеллект — это дар, который нужно использовать с умом.' },
  { id: 'wight_01', title: 'Великая ответственность', desc: 'Слияние с фокусом (60000 минут)', type: 'totalMinutes', max: 60000, img: '/achievements/spider/wight.svg', rarity: 'Mythic', color: '#ef4444', collection: 'Человек-Паук', lore: 'Ты не бросаешь начатое, когда становится тяжело. Настоящий герой тот, кто не сдается под тяжестью долга.' },
  { id: 'portal_01', title: 'Сквозь Вселенные', desc: 'Сквозь миры (14 активных дней)', type: 'activeDays', max: 14, img: '/achievements/spider/portal_colorful.svg', rarity: 'Common', color: '#94a3b8', collection: 'Человек-Паук', lore: 'Ты научился балансировать между сотнями задач, сохраняя свою уникальность в хаосе реальностей.' },
  { id: 'spider_01', title: 'Amazing Spider-Focus', desc: 'Герой города (365 активных дней)', type: 'activeDays', max: 365, img: '/achievements/spider/spider.svg', rarity: 'Mythic', color: '#ef4444', collection: 'Человек-Паук', lore: 'Ты на пике формы. Ты — защитник своего времени, способный остановить любой хаос одним рывком.' },

  // Ветка 3: Лило и Стич (Lilo & Stitch)
  { id: 'stitch_capsule_01', title: 'Эксперимент 626', desc: 'Создание гения (6260 пыльцы)', type: 'focusDust', max: 6260, img: '/achievements/stitch/capsule.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Стич', lore: 'Ты создан для разрушения, но выбрал путь созидания. Твой первый запуск — начало новой программы.' },
  { id: 'stitch_hand_01', title: 'Дух Алоха', desc: 'Инопланетный друг (3000 минут)', type: 'totalMinutes', max: 3000, img: '/achievements/stitch/hand.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Стич', lore: 'Радость от встречи с новым днем. Улыбнись дисциплине, и она станет твоим лучшим союзником.' },
  { id: 'stitch_camera_01', title: 'Лило', desc: 'Сохранить момент (60 активных дней)', type: 'activeDays', max: 60, img: '/achievements/stitch/camera.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Стич', lore: 'Даже самому странному существу нужен друг. Твоя дисциплина — это Лило, которая верит в тебя, когда ты оступаешься.' },
  { id: 'stitch_star_01', title: 'Галактическая Федерация', desc: 'Космическое путешествие (30000 пыльцы)', type: 'focusDust', max: 30000, img: '/achievements/stitch/star.svg', rarity: 'Legendary', color: '#eab308', collection: 'Стич', lore: 'Твои успехи заметили на высшем уровне. Порядок в делах признан законом во всей твоей личной вселенной.' },
  { id: 'stitch_flower_01', title: 'Охана', desc: 'Семья значит никто не забыт (30 активных дней)', type: 'activeDays', max: 30, img: '/achievements/stitch/flower.svg', rarity: 'Rare', color: '#38bdf8', collection: 'Стич', lore: 'Охана — значит семья. Семья — значит, что никто не будет брошен или забыт. Не бросай свою привычку.' },
  { id: 'stitch_alien_01', title: 'Межгалактический Стич', desc: 'Полный фокус (100000 пыльцы)', type: 'focusDust', max: 100000, icon: 'rocket_launch', rarity: 'Mythic', color: '#ef4444', collection: 'Стич', lore: 'Ты полностью одомашнен дисциплиной. Теперь ты — самый преданный защитник своей «семьи» идеалов.' },

  // Ветка 4: Скорбь Сатаны и Ave Maria
  { id: 'satan_01', title: 'Сделка с полночью', desc: 'Успех в тишине (1000 минут)', type: 'totalMinutes', max: 1000, icon: 'dark_mode', rarity: 'Epic', color: '#a855f7', collection: 'Скорбь Сатаны', lore: 'Когда мир спит, Сатана предлагает успех в обмен на сон. Ты выбрал работу в тишине ночи.' },
  { id: 'satan_02', title: 'Ангельское утро', desc: 'Чистый свет (30 активных дней)', type: 'activeDays', max: 30, icon: 'wb_sunny', rarity: 'Rare', color: '#38bdf8', collection: 'Скорбь Сатаны', lore: 'Ave Maria — чистый свет зари. Первые часы дня принадлежат твоим самым светлым и важным помыслам.' },
  { id: 'satan_03', title: 'Искушение ленью', desc: 'Отвергая безделье (5000 пыльцы)', type: 'focusDust', max: 5000, icon: 'local_fire_department', rarity: 'Rare', color: '#38bdf8', collection: 'Скорбь Сатаны', lore: 'Джеффри Темпест поддался богатству, ты же отверг легкий путь безделья ради истинного труда.' },
  { id: 'satan_04', title: 'Чистый разум', desc: 'Отказ от суеты (10000 минут)', type: 'totalMinutes', max: 10000, icon: 'psychology', rarity: 'Epic', color: '#a855f7', collection: 'Скорбь Сатаны', lore: 'Отказ от суеты и ложных ценностей. Твой разум — это храм, в котором нет места лишнему шуму.' },
  { id: 'satan_05', title: 'Свет зари', desc: 'Победа над тьмой (30000 пыльцы)', type: 'focusDust', max: 30000, icon: 'lightbulb', rarity: 'Legendary', color: '#eab308', collection: 'Скорбь Сатаны', lore: 'Победа над внутренней тьмой. Твои усилия окупаются с первыми лучами солнца, принося покой и ясность.' },
  { id: 'satan_06', title: 'Триумф Воли', desc: 'Воля непоколебима (180 активных дней)', type: 'activeDays', max: 180, icon: 'emoji_events', rarity: 'Mythic', color: '#ef4444', collection: 'Скорбь Сатаны', lore: 'Ты прошел через искушения и тьму. Твоя воля непоколебима, ты сам творишь свою судьбу.' },

  // Ветка 5: Проект «Аве Мария» (Project Hail Mary)
  { id: 'hail_01', title: 'Корабль «Аве Мария»', desc: 'Цель - выжить (3 активных дня)', type: 'activeDays', max: 3, icon: 'rocket', rarity: 'Common', color: '#94a3b8', collection: 'Проект Аве Мария', lore: 'Ты проснулся в пустоте, не помня своего имени, но зная свою задачу. Цель — выжить и спасти всё, что тебе дорого.' },
  { id: 'hail_02', title: 'Линии Петровой', desc: 'Загадка света (3000 минут)', type: 'totalMinutes', max: 3000, icon: 'scatter_plot', rarity: 'Rare', color: '#38bdf8', collection: 'Проект Аве Мария', lore: 'Загадка, поглощающая свет звезд. Ты нашел проблему, теперь используй науку, чтобы превратить её в решение.' },
  { id: 'hail_03', title: 'Amaze! Amaze! Amaze!', desc: 'Встреча с Рокки (60 активных дней)', type: 'activeDays', max: 60, icon: 'handshake', rarity: 'Epic', color: '#a855f7', collection: 'Проект Аве Мария', lore: 'Ты встретил Рокки. Дружба двух видов основана на математике и общей цели. Вместе вы эффективнее.' },
  { id: 'hail_04', title: 'Ксенонит', desc: 'Самый прочный материал (30000 пыльцы)', type: 'focusDust', max: 30000, icon: 'diamond', rarity: 'Legendary', color: '#eab308', collection: 'Проект Аве Мария', lore: 'Самый прочный материал во Вселенной, созданный эридианцами. Твоя концентрация стала такой же твердой и прозрачной.' },
  { id: 'hail_05', title: 'Таумеба', desc: 'Чистая энергия (60000 минут)', type: 'totalMinutes', max: 60000, icon: 'science', rarity: 'Mythic', color: '#ef4444', collection: 'Проект Аве Мария', lore: 'Крошечный враг стал топливом. Ты научился обращать свои слабости в чистую энергию для движения вперед.' },
  { id: 'hail_06', title: 'Планета Эрид', desc: 'Миссия выполнена (100000 пыльцы)', type: 'focusDust', max: 100000, icon: 'public', rarity: 'Mythic', color: '#ef4444', collection: 'Проект Аве Мария', lore: 'Миссия выполнена. Земля спасена, а ты обрел новый дом в мире науки и бесконечного познания. «Рад, вопрос?» — «Рад, ответ!»' },
];

const labels = `
export const RARITY_LABELS: Record<string, string> = {
  'Common': 'Обычная',
  'Rare': 'Редкая',
  'Epic': 'Эпическая',
  'Legendary': 'Легендарная',
  'Mythic': 'Мифическая'
};
`;

let content = `export const ACHIEVEMENTS = ${JSON.stringify(achievements, null, 2)};\n${labels}`;
fs.writeFileSync('src/achievementsData.ts', content);
console.log("Updated achievementsData.ts");
