import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Increase payload limit for avatar base64 uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const DB_FILE = path.join(process.cwd(), 'db_store.json');

interface DBData {
  users: Array<{ username: string; joined_at: string; last_active: string; device_info: string }>;
  scores: Array<{ id: string; username: string; subject_id: string; subject_name: string; score: number; max_questions: number; streak: number; created_at: string; device_info?: string }>;
  profiles: Record<string, { username: string; avatar: string; bio: string; joined_at: string; last_active: string; device_info: string }>;
  friends: Record<string, string[]>;
  friendRequests: Array<{ id: string; fromUsername: string; toUsername: string; timestamp: string; status: 'pending' | 'accepted' | 'rejected' }>;
  chatMessages: Array<{ id: string; sender: string; recipient?: string; text: string; timestamp: string; isGlobal: boolean; avatar?: string }>;
}

let dbData: DBData = {
  users: [],
  scores: [],
  profiles: {},
  friends: {},
  friendRequests: [],
  chatMessages: [],
};

// Load initial DB from file if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbData = { ...dbData, ...JSON.parse(raw) };
  }
} catch (e) {
  console.error('Failed to read db_store.json', e);
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save db_store.json', e);
  }
}

// API Routes
app.get('/api/all-data', (req, res) => {
  res.json(dbData);
});

app.post('/api/register-user', (req, res) => {
  const { username, deviceInfo } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.trim();
  const cleanLower = clean.toLowerCase();
  const now = new Date().toISOString();

  const idx = dbData.users.findIndex(u => u.username.toLowerCase() === cleanLower);
  if (idx !== -1) {
    dbData.users[idx].last_active = now;
    if (deviceInfo) dbData.users[idx].device_info = deviceInfo;
  } else {
    dbData.users.push({
      username: clean,
      joined_at: now,
      last_active: now,
      device_info: deviceInfo || 'ไม่ทราบอุปกรณ์',
    });
  }

  saveDB();
  res.json({ success: true, users: dbData.users });
});

app.post('/api/update-profile', (req, res) => {
  const { username, avatar, bio, deviceInfo } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.trim();
  const cleanLower = clean.toLowerCase();
  const now = new Date().toISOString();

  const current = dbData.profiles[cleanLower] || {
    username: clean,
    avatar: avatar || '',
    bio: bio || 'เด็กเตรียมสอบ WINTER 2026 ✌️',
    joined_at: now,
    last_active: now,
    device_info: deviceInfo || 'ไม่ทราบอุปกรณ์',
  };

  dbData.profiles[cleanLower] = {
    ...current,
    ...(avatar ? { avatar } : {}),
    ...(bio !== undefined ? { bio } : {}),
    username: clean,
    last_active: now,
    ...(deviceInfo ? { device_info: deviceInfo } : {}),
  };

  saveDB();
  res.json({ success: true, profile: dbData.profiles[cleanLower] });
});

app.post('/api/submit-score', (req, res) => {
  const { username, subjectId, subjectName, score, maxQuestions, streak, deviceInfo } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.trim();
  const newRecord = {
    id: Math.random().toString(36).substring(2, 9),
    username: clean,
    subject_id: subjectId,
    subject_name: subjectName || subjectId,
    score: Number(score) || 0,
    max_questions: Number(maxQuestions) || 0,
    streak: Number(streak) || 0,
    created_at: new Date().toISOString(),
    device_info: deviceInfo || 'ไม่ทราบอุปกรณ์',
  };

  dbData.scores.push(newRecord);

  // Update user last active
  const cleanLower = clean.toLowerCase();
  const uIdx = dbData.users.findIndex(u => u.username.toLowerCase() === cleanLower);
  if (uIdx !== -1) {
    dbData.users[uIdx].last_active = newRecord.created_at;
  } else {
    dbData.users.push({
      username: clean,
      joined_at: newRecord.created_at,
      last_active: newRecord.created_at,
      device_info: deviceInfo || 'ไม่ทราบอุปกรณ์',
    });
  }

  saveDB();
  res.json({ success: true, record: newRecord });
});

app.post('/api/chat', (req, res) => {
  const { sender, text, recipient, isGlobal, avatar } = req.body;
  if (!sender || !text) return res.status(400).json({ error: 'Sender and text required' });

  const msg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sender: sender.trim(),
    text: text.trim(),
    recipient: recipient ? recipient.trim() : undefined,
    timestamp: new Date().toISOString(),
    isGlobal: isGlobal !== false,
    avatar,
  };

  dbData.chatMessages.push(msg);
  if (dbData.chatMessages.length > 500) {
    dbData.chatMessages = dbData.chatMessages.slice(-500);
  }

  saveDB();
  res.json({ success: true, message: msg });
});

app.post('/api/friend-request', (req, res) => {
  const { action, requestId, fromUsername, toUsername } = req.body;

  if (action === 'send') {
    const cleanFrom = fromUsername.trim();
    const cleanTo = toUsername.trim();
    const reqItem = {
      id: 'freq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fromUsername: cleanFrom,
      toUsername: cleanTo,
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
    };
    dbData.friendRequests.push(reqItem);
    saveDB();
    return res.json({ success: true, request: reqItem });
  }

  if (action === 'accept' && requestId) {
    const freq = dbData.friendRequests.find(r => r.id === requestId);
    if (freq) {
      freq.status = 'accepted';
      const fromLower = freq.fromUsername.toLowerCase();
      const toLower = freq.toUsername.toLowerCase();

      if (!dbData.friends[fromLower]) dbData.friends[fromLower] = [];
      if (!dbData.friends[toLower]) dbData.friends[toLower] = [];

      if (!dbData.friends[fromLower].includes(freq.toUsername)) dbData.friends[fromLower].push(freq.toUsername);
      if (!dbData.friends[toLower].includes(freq.fromUsername)) dbData.friends[toLower].push(freq.fromUsername);

      saveDB();
    }
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Invalid action' });
});

app.post('/api/admin/clear-all', (req, res) => {
  dbData.scores = [];
  dbData.users = [];
  saveDB();
  res.json({ success: true });
});

app.post('/api/admin/delete-user', (req, res) => {
  const { usernameToDelete } = req.body;
  if (!usernameToDelete) return res.status(400).json({ error: 'Username required' });

  const clean = usernameToDelete.trim().toLowerCase();
  dbData.users = dbData.users.filter(u => u.username.toLowerCase() !== clean);
  dbData.scores = dbData.scores.filter(s => s.username.toLowerCase() !== clean);
  delete dbData.profiles[clean];

  saveDB();
  res.json({ success: true });
});

// Vite middleware for dev / express static for prod
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
