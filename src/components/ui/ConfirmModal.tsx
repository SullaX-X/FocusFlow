import { motion } from 'motion/react';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = "Подтвердить", cancelText = "Отмена", hideCancel = false }: Props) {
  return (
    <div id="confirm-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1500] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-theme-card border border-theme-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-xl font-bold text-theme-text mb-2">{title}</h3>
        <p className="text-theme-muted mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
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
            className="px-4 py-2 bg-theme-accent hover:opacity-80 hover:scale-105 active:scale-95 text-text-on-accent rounded-xl font-medium transition-all shadow-lg hover:shadow-[0_0_15px_currentColor]"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
