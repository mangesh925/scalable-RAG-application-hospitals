import { config } from 'dotenv';
import path from 'path';

// Load .env from client folder
config({ path: path.resolve('../client/.env') });

import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CharacterTextSplitter } from '@langchain/textsplitters';

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    try {
      console.log(`Processing job ${job.id}:`, job.data);
      
      let data;
      if (typeof job.data === 'string') {
        data = JSON.parse(job.data);
      } else {
        data = job.data;
      }
      
      console.log('Parsed data:', data);
      console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
      
      if (!data || !data.path) {
        throw new Error(`Missing file path in job data. Data: ${JSON.stringify(data)}`);
      }

      // Load the PDF
      console.log('Loading PDF from:', data.path);
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();
      console.log(`Loaded ${docs.length} documents`);

      // Chunk the documents
      const textSplitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await textSplitter.splitDocuments(docs);
      console.log(`Split into ${splitDocs.length} chunks`);

      // Initialize embeddings
      const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY,
      });

      // CLEAR EXISTING COLLECTION AND RECREATE
      console.log('Clearing existing collection...');
      try {
        // Delete existing collection
        const deleteResponse = await fetch('http://localhost:6333/collections/langchainjs-testing', {
          method: 'DELETE'
        });
        console.log('Collection deleted');
      } catch (error) {
        console.log('Collection might not exist, continuing...');
      }

      // Wait a moment for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recreate collection
      const createResponse = await fetch('http://localhost:6333/collections/langchainjs-testing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vectors: {
            size: 1536,
            distance: 'Cosine'
          }
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to recreate collection');
      }
      console.log('Collection recreated');

      // Wait for collection to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Connect to vector store and add documents
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: 'http://localhost:6333',
          collectionName: 'langchainjs-testing',
        }
      );
      
      // Add metadata to track current document
      const docsWithMetadata = splitDocs.map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          filename: data.filename,
          uploadedAt: new Date().toISOString(),
          source: data.path
        }
      }));
      
      await vectorStore.addDocuments(docsWithMetadata);
      console.log(`Successfully added ${splitDocs.length} chunks to vector store`);
      
      return { 
        success: true, 
        documentsProcessed: docs.length,
        chunksCreated: splitDocs.length,
        filename: data.filename
      };
      
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  },
  {
    concurrency: 1, // Process one file at a time
    connection: {
      host: 'localhost',
      port: 6379,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }
);

// Event listeners
worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

console.log('🚀 Worker started and listening for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});
