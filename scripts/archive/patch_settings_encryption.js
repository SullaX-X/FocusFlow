import fs from 'fs';
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const encryptionBlock = `
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Шифрование Инбокса</h3>
          <Tooltip text="Zero-Knowledge Encryption (AES-GCM). Шифрование происходит только на вашем устройстве. Если вы забудете пароль, доступ к данным будет навсегда утерян." />
        </div>
        
        <div className="space-y-5">
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block px-1">Ключ шифрования (Пароль)</label>
            <input 
              type="password"
              placeholder="Введите пароль для шифрования..."
              className="w-full bg-theme-text/2 border border-theme-text/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-theme-accent transition-all"
              value={localStorage.getItem('focusmoon_inbox_password') || ''}
              onChange={e => {
                const val = e.target.value;
                if (val) {
                  localStorage.setItem('focusmoon_inbox_password', val);
                } else {
                  localStorage.removeItem('focusmoon_inbox_password');
                }
                // force re-render
                setWebhookUrl(webhookUrl + ' ');
                setTimeout(() => setWebhookUrl(webhookUrl.trim()), 0);
              }}
            />
            <p className="text-[11px] text-theme-muted mt-3">Пароль никогда не покидает ваше устройство.</p>
          </div>
        </div>
      </section>
`;

content = content.replace('<section>', encryptionBlock + '\n      <section>');
fs.writeFileSync('src/components/Settings.tsx', content);
