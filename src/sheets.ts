export async function syncToSheets(data: any, webhookUrl: string): Promise<void> {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Plain text helps bypass some CORS issues with Apps Script
      }
    });
  } catch (error) {
    console.error('Failed to sync to sheets webhook:', error);
  }
}
