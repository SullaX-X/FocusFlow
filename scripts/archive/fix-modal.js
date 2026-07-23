import fs from 'fs';

const file = 'src/components/ConfirmModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {`;

const replacement = `interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = "Подтвердить", cancelText = "Отмена", hideCancel = false }: Props) {`;

const target2 = `        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-theme-muted hover:bg-theme-border-border rounded-xl font-medium transition-colors"
          >
            Отмена
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-theme-accent hover:bg-theme-accent/90    text-text-on-accent rounded-xl font-medium transition-colors"
          >
            Подтвердить
          </button>
        </div>`;

const replacement2 = `        <div className="flex justify-end gap-3">
          {!hideCancel && (
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-theme-muted hover:bg-theme-border-border rounded-xl font-medium transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-theme-accent hover:bg-theme-accent/90    text-text-on-accent rounded-xl font-medium transition-colors"
          >
            {confirmText}
          </button>
        </div>`;

if (content.includes(target) && content.includes(target2)) {
  content = content.replace(target, replacement).replace(target2, replacement2);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
