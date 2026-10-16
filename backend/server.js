require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const requestedPort = Number(process.env.PORT) || 5000;
const frontendPath = path.join(__dirname, '..', 'frontend');
const liveServerOrigins = new Set([
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

function startListening(port) {
  app.listen(port, () => {
    console.log(`Student Feedback Manager running at http://localhost:${port}`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${fallbackPort}.`);
      startListening(fallbackPort);
      return;
    }

    console.error('Server failed to start:', error.message);
    process.exit(1);
  });
}

app.use((req, res, next) => {
  const origin = req.get('Origin');

  if (origin && liveServerOrigins.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
  }

  next();
});

app.use(express.json());
app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'demo'
  });
});

app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'feedback.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(frontendPath, 'feedback.html'));
});

app.get('/feedback.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'feedback.html'));
});

app.get('/all-feedback', (req, res) => {
  res.sendFile(path.join(frontendPath, 'all-feedback.html'));
});

app.get('/all-feedback.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'all-feedback.html'));
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is missing. Database actions are disabled.');
  } else {
    mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .then(() => console.log('Connected to MongoDB.'))
      .catch((error) => console.error('MongoDB connection failed. Start MongoDB or add a MongoDB Atlas URI in backend/.env:', error.message));
  }

  startListening(requestedPort);
}

startServer();
