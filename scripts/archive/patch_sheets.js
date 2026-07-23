import fs from 'fs';
let content = fs.readFileSync('src/sheets.ts', 'utf8');

const newContent = `import { get, set, del } from 'idb-keyval';

export async function syncToSheets(data: any, webhookUrl: string): Promise<void> {
  if (!webhookUrl) return;

  if (!navigator.onLine) {
    console.log('Offline: Queuing sync payload to IndexedDB');
    await set('focusmoon_sync_queue', { data, webhookUrl });
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      }
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    // Successfully synced, clear queue
    await del('focusmoon_sync_queue');
  } catch (error) {
    console.log('Sync failed: Queuing sync payload to IndexedDB');
    await set('focusmoon_sync_queue', { data, webhookUrl });
    throw error;
  }
}

export async function pullFromSheets(webhookUrl: string): Promise<any> {
  if (!webhookUrl) return null;
  if (!navigator.onLine) return null;
  try {
    const url = new URL(webhookUrl);
    url.searchParams.append('t', Date.now().toString());
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('Failed to pull from sheets webhook:', error);
    return null;
  }
}

// Background sync processor
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const queue = await get('focusmoon_sync_queue');
    if (queue) {
      console.log('Online: Processing sync queue');
      try {
        await syncToSheets(queue.data, queue.webhookUrl);
        await del('focusmoon_sync_queue');
      } catch (e) {
        console.error('Failed to process sync queue on reconnect:', e);
      }
    }
  });
}
`;

fs.writeFileSync('src/sheets.ts', newContent);
