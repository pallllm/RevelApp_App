import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

// Routes (will be created)
// import authRoutes from './routes/auth';
// import facilitiesRoutes from './routes/facilities';
// import membersRoutes from './routes/members';
// import gamesRoutes from './routes/games';
// import healthRoutes from './routes/health';
// import wagesRoutes from './routes/wages';
// import changeRequestsRoutes from './routes/changeRequests';
// import notificationsRoutes from './routes/notifications';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api';

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes (uncomment as implemented)
// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/facilities`, facilitiesRoutes);
// app.use(`${API_PREFIX}/members`, membersRoutes);
// app.use(`${API_PREFIX}/games`, gamesRoutes);
// app.use(`${API_PREFIX}/health`, healthRoutes);
// app.use(`${API_PREFIX}/wages`, wagesRoutes);
// app.use(`${API_PREFIX}/change-requests`, changeRequestsRoutes);
// app.use(`${API_PREFIX}/notifications`, notificationsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use(errorHandler);

// ============================================
// Server Start
// ============================================

app.listen(PORT, () => {
  logger.info(`🚀 RevelApp Backend Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
});

export default app;
