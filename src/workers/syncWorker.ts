
import { Discipline } from '../types';

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'MERGE_DATA') {
    const { remoteData, localDisciplines, localStats, localInbox } = payload;
    
    let mergedDisciplines = [...localDisciplines];
    let mergedStats = { ...localStats };
        let mergedInbox: any = typeof localInbox === 'string' ? localInbox : (Array.isArray(localInbox) ? [...localInbox] : []);

    if (remoteData.inbox) {
      if (typeof remoteData.inbox === 'string') {
        // Remote is encrypted string. If local is different or empty, we probably just take remote? 
        // Actually, merging encrypted strings is impossible. 
        // Let's just use remote if local is empty array, or if they are different string, we can't easily merge. We'll stick to local if it exists to avoid overwriting newer local with older remote.
        if (typeof localInbox !== 'string' && (!localInbox || localInbox.length === 0)) {
          mergedInbox = remoteData.inbox;
        }
      } else if (Array.isArray(remoteData.inbox) && Array.isArray(mergedInbox)) {
        remoteData.inbox.forEach((rItem: any) => {
          if (!mergedInbox.find((i: any) => i.id === rItem.id)) {
            mergedInbox.push(rItem);
          }
        });
      }
    }


    self.postMessage({ 
      type: 'MERGE_COMPLETE', 
      payload: { mergedDisciplines, mergedStats, mergedInbox } 
    });
  }
};
