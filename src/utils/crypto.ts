// AES-GCM encryption for Inbox
const generateKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptText = async (text: string, password?: string): Promise<string> => {
  if (!password) return text; // If no password, store plain text
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await generateKey(password, salt);
    
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encoded
    );
    
    // Combine salt, iv, and ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    
    // Convert to base64
    return "ENC:" + btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

export const decryptText = async (encryptedText: string, password?: string): Promise<string> => {
  if (!encryptedText.startsWith("ENC:")) return encryptedText; // Not encrypted
  if (!password) return "Locked (Need password)"; // Needs password
  
  try {
    const b64 = encryptedText.substring(4);
    const combined = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);
    
    const key = await generateKey(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return "Locked (Wrong password)";
  }
};
