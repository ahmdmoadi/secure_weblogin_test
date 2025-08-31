let express = require("express");
const mysql = require("mysql2/promise");
const argon2 = require("argon2");
let app = express();
let path = require("path");
let crypto = require("crypto");
const fs = require('fs');
const { constants } = crypto;
const bodyParser = require("body-parser");
//id_ed25519

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


const privateKeyPem = fs.readFileSync('./private-key.pem'); // keep safe!

app.post('/login-encrypted', async (req, res) => {
  const { keyId, ct } = req.body || {};
  // verify keyId if you rotate keys
  const buf = Buffer.from(ct, 'base64');
  let plaintext;
  try {
    plaintext = crypto.privateDecrypt(
      { key: privateKeyPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      buf
    );
  } catch {
    return res.status(400).json({ error: 'Bad ciphertext' });
  }

  const { username, password, nonce, ts } = JSON.parse(plaintext.toString('utf8'));
  if (!await nonces.consume(nonce)) return res.status(400).json({ error: 'Replay' });
  if (Math.abs(Date.now() - ts) > 60_000) return res.status(400).json({ error: 'Stale' });

  const user = await db.users.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await argon2.verify(user.pwHash, password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  // issue session...
  return res.json({ ok: true });
});

