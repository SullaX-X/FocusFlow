
let intervalId: ReturnType<typeof setInterval> | null = null;
let livenessId: ReturnType<typeof setInterval> | null = null;
let startTime = 0;
let durationMs = 0;
let isActive = false;
let accumulatedMs = 0;
let targetEndTime = 0;

// Liveness interval to prevent the browser from killing the worker
if (!livenessId) {
  livenessId = setInterval(() => {
    // Just a dummy message or operation to keep the thread alive
  }, 30000); 
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      if (isActive) return;
      isActive = true;
      startTime = Date.now();
      
      if (payload?.durationMs) {
        durationMs = payload.durationMs;
      }
      
      // Calculate target end time for absolute sync
      targetEndTime = Date.now() + (durationMs - accumulatedMs);
      
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (isActive) {
            const now = Date.now();
            const elapsedSinceStart = now - startTime;
            const totalElapsed = accumulatedMs + elapsedSinceStart;
            
            // Heartbeat: provide both relative and absolute timestamps
            self.postMessage({ 
              type: 'TICK', 
              payload: { 
                totalElapsedMs: totalElapsed,
                remainingMs: Math.max(0, durationMs - totalElapsed),
                targetEndTime: targetEndTime,
                serverNow: now
              } 
            });
          }
        }, 1000); // 1 second is enough for a timer heartbeat
      }
      break;

    case 'PAUSE':
      if (isActive) {
        accumulatedMs += (Date.now() - startTime);
        isActive = false;
      }
      break;

    case 'STOP':
    case 'RESET':
      isActive = false;
      accumulatedMs = 0;
      startTime = 0;
      targetEndTime = 0;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;

    case 'SYNC_TIME':
      if (isActive) {
        accumulatedMs += (Date.now() - startTime);
        startTime = Date.now();
        // Recalculate target end time based on accumulated drift if needed
        targetEndTime = startTime + (durationMs - accumulatedMs);
      }
      break;
  }
};
