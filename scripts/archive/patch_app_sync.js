import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const parseReplacement = `
            let inboxData = [];
            const rawInbox = localStorage.getItem('focusmoon_inbox');
            if (rawInbox) {
              if (rawInbox.startsWith('ENC:')) {
                inboxData = rawInbox; // Send as string to Sheets
              } else {
                try { inboxData = JSON.parse(rawInbox); } catch(e) {}
              }
            }
`;

content = content.replace("const inboxData = JSON.parse(localStorage.getItem('focusmoon_inbox') || '[]');", parseReplacement);

const mergeReplacement = `
            let localInbox = [];
            const rawLocal = localStorage.getItem('focusmoon_inbox');
            if (rawLocal && !rawLocal.startsWith('ENC:')) {
               try { localInbox = JSON.parse(rawLocal); } catch(e) {}
            }
            // If it is encrypted, we don't merge it server-side, we just overwrite it with remote if remote is newer, but syncWorker doesn't know.
            // For zero-knowledge, merging is hard. We'll pass it as is.
            const payloadLocalInbox = rawLocal?.startsWith('ENC:') ? rawLocal : localInbox;
`;

content = content.replace("localInbox: JSON.parse(localStorage.getItem('focusmoon_inbox') || '[]')", "localInbox: payloadLocalInbox");

content = content.replace("syncWorker.postMessage({ type: 'MERGE_DATA', payload: {", mergeReplacement + "\\n              syncWorker.postMessage({ type: 'MERGE_DATA', payload: {");

fs.writeFileSync('src/App.tsx', content);
