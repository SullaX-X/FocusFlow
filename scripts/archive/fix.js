import fs from 'fs';

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  const targetRegex = /<ConfirmModal\s+isOpen=\{!!confirmSound\}\s+onClose=\{\(\) => setConfirmSound\(null\)\}\s+onConfirm=\{\(\) => \{([\s\S]*?)\}\}\s+title="Покупка звука"\s+message=\{([\s\S]*?)\}\s+confirmText="Купить"\s+cancelText="Отмена"\s+\/>/m;
  
  const match = content.match(targetRegex);
  if (match) {
    const fixed = `{confirmSound && (
      <ConfirmModal
        onCancel={() => setConfirmSound(null)}
        onConfirm={() => {${match[1]}}}
        title="Покупка звука"
        message={${match[2]}}
      />
    )}`;
    content = content.replace(match[0], fixed);
    fs.writeFileSync(file, content);
    console.log("Fixed " + file);
  } else {
    console.log("No match in " + file);
  }
};
fixFile('src/components/Settings.tsx');
fixFile('src/components/FocusMode.tsx');
