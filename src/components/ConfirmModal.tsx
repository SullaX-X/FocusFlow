import { motion } from 'motion/react';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-[#908fa0] mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-[#908fa0] hover:bg-slate-100 dark:hover:bg-[#1c2b3c] rounded-xl font-medium transition-colors"
          >
            Отмена
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-[#494bd6] dark:hover:bg-[#c0c1ff] dark:hover:text-[#1000a9] text-white rounded-xl font-medium transition-colors"
          >
            Подтвердить
          </button>
        </div>
      </motion.div>
    </div>
  );
}
