export async function syncToSheets(data: any, webhookUrl: string): Promise<void> {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      }
    });
  } catch (error) {
    console.error('Failed to sync to sheets webhook:', error);
  }
}

export async function pullFromSheets(webhookUrl: string): Promise<any> {
  if (!webhookUrl) return null;

  try {
    // Append timestamp to prevent caching
    const url = new URL(webhookUrl);
    url.searchParams.append('t', Date.now().toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to pull from sheets webhook (likely CORS/deployment issue):', error);
    return null;
  }
}
