// DEVARENA Real-Time WebSocket & REST Relay Server
import http from 'http';

const PORT = process.env.PORT || 3001;

// Lightweight in-memory room store
const rooms = new Map();

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'DEVARENA Engine',
      version: '1.0.0',
      activeRooms: rooms.size,
      uptime: process.uptime()
    }));
    return;
  }

  if (url.pathname === '/api/rooms' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      rooms: Array.from(rooms.keys())
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[DEVARENA] Real-Time Relay Server running on port ${PORT}`);
});

