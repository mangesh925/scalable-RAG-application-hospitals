const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  return res.json({ status: 'Hospital RAG Server Running on Vercel' });
});

app.get('/api/test', (req, res) => {
  return res.json({ message: 'API is working' });
});

// Export for Vercel
module.exports = app;
