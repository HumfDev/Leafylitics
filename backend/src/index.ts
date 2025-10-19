/**
 * Leafylitics Backend API
 * Plant health analysis using Gemini AI API
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { join } from 'path';
import analysisRoutes from './routes/analysis.js';

// Load environment variables from root directory
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '../.env') });

// Debug: Check if environment variables are loaded
console.log('🔑 GOOGLE_API_KEY loaded:', process.env['GOOGLE_API_KEY'] ? 'Yes' : 'No');
console.log('🔑 API Key preview:', process.env['GOOGLE_API_KEY'] ? process.env['GOOGLE_API_KEY'].substring(0, 10) + '...' : 'Not found');

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Routes
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Leafylitics API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Leafylitics API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analysis: '/api/analysis'
    }
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 Leafylitics API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Analysis API: http://localhost:${PORT}/api/analysis`);
});

export default app;
