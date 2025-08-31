// Fetch SPKI public key PEM and a one-time nonce
const [pem, { nonce, keyId }] = await Promise.all([
  fetch('/auth/key').then(r => r.text()),
  fetch('/auth/nonce').then(r => r.json())
]);

const spki = pemToArrayBuffer(pem);
const pubKey = await crypto.subtle.importKey(
  'spki', spki, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']
);

const payload = new TextEncoder().encode(JSON.stringify({
  username, password, nonce, ts: Date.now()
}));
const ciphertext = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, payload);
const b64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

await fetch('/login-encrypted', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keyId, ct: b64 })
});

// helper: turn PEM -> ArrayBuffer
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
