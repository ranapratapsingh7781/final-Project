require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ===== MIDDLEWARE =====
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));

// ===== HEALTH CHECK ENDPOINT =====
app.get('/', (req, res) => {
  res.json({ msg: 'E-Wallet Backend API is running' });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal server error.' });
});

// ===== START SERVER =====
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async (port) => {
  try {
    // Connect to database before starting server
    await connectDB();

    const server = app.listen(port, () => {
      console.log(`\n✅ E-Wallet Server running on port ${port}`);
      console.log(`📍 Local: http://localhost:${port}`);
      console.log(`📍 API: http://localhost:${port}/api\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`Port ${port} is already in use. Trying port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('Server startup aborted due to database connection failure.');
    process.exit(1);
  }
};

// Initialize and start the server
startServer(BASE_PORT);