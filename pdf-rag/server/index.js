import { config } from 'dotenv';
import path from 'path';

// Load .env from client folder
config({ path: path.resolve('../client/.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';
import fs from 'fs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const queue = new Queue('file-upload-queue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

// Track current document
let currentDocument = null;

app.get('/', (req, res) => {
  return res.json({ status: 'All Good!' });
});

// Get current document info
app.get('/current-document', (req, res) => {
  return res.json({ currentDocument });
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  try {
    // Clear previous uploads directory (optional - keeps only current file)
    const uploadsDir = 'uploads/';
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      if (file !== req.file.filename) {
        try {
          fs.unlinkSync(path.join(uploadsDir, file));
        } catch (err) {
          console.log('Could not delete old file:', file);
        }
      }
    });

    // Update current document tracking
    currentDocument = {
      filename: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      status: 'processing'
    };

    await queue.add(
      'file-ready',
      JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,
      })
    );

    return res.json({ 
      message: 'uploaded',
      filename: req.file.originalname 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/chat', async (req, res) => {
  try {
    const userQuery = req.query.message;
    
    if (!userQuery) {
      return res.status(400).json({ error: 'Missing message parameter' });
    }

    // Check if there's a current document
    if (!currentDocument) {
      return res.status(400).json({ 
        error: 'No document uploaded. Please upload a PDF first.' 
      });
    }

    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: 'http://localhost:6333',
        collectionName: 'langchainjs-testing',
      }
    );
    
    const ret = vectorStore.asRetriever({
      k: 3, // Get more chunks for better context
    });
    const result = await ret.invoke(userQuery);

    // Enhanced system prompt with document context
    const SYSTEM_PROMPT = `
    You are a helpful AI Assistant who answers user queries based on the uploaded PDF document: "${currentDocument.filename}".
    
    Context from the document:
    ${JSON.stringify(result)}
    
    Instructions:
    - Answer based only on the provided context from the PDF
    - If the question cannot be answered from the document, say so clearly
    - Be specific and cite relevant parts of the document when possible
    - Keep responses concise but informative
    `;

    const chatResult = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userQuery },
      ],
    });

    // Update document status to ready after first successful query
    if (currentDocument.status === 'processing') {
      currentDocument.status = 'ready';
    }

    return res.json({
      message: chatResult.choices[0].message.content,
      docs: result,
      currentDocument: currentDocument.filename
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to process query' });
  }
});

// Clear current document and vector store
app.delete('/clear-document', async (req, res) => {
  try {
    // Clear uploads directory
    const uploadsDir = 'uploads/';
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(uploadsDir, file));
      } catch (err) {
        console.log('Could not delete file:', file);
      }
    });

    // Clear vector store
    await fetch('http://localhost:6333/collections/langchainjs-testing', {
      method: 'DELETE'
    });

    currentDocument = null;

    return res.json({ message: 'Document cleared successfully' });
  } catch (error) {
    console.error('Clear error:', error);
    return res.status(500).json({ error: 'Failed to clear document' });
  }
});

app.listen(8000, () => console.log(`Server started on PORT:${8000}`));
