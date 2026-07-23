
self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'PARSE_NLP') {
    const { text } = payload;
    let cleanText = text;
    const metadata: any = {};

    const dateMatch = text.match(/@(\S+)/);
    if (dateMatch) {
      metadata.date = dateMatch[1].replace(/_/g, ' ');
      cleanText = cleanText.replace(dateMatch[0], '');
    }

    const energyMatch = text.match(/#(\S+)/);
    if (energyMatch) {
      metadata.energy = energyMatch[1].replace(/_/g, ' ');
      cleanText = cleanText.replace(energyMatch[0], '');
    }

    const categoryMatch = text.match(/!(\S+)/);
    if (categoryMatch) {
      metadata.category = categoryMatch[1].replace(/_/g, ' ');
      cleanText = cleanText.replace(categoryMatch[0], '');
    }

    self.postMessage({ 
      type: 'PARSE_COMPLETE', 
      payload: { 
        id: crypto.randomUUID(),
        text: cleanText.trim() || text.trim(),
        createdAt: new Date().toISOString(),
        metadata 
      } 
    });
  }
};
