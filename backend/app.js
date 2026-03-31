/**
 * Smart Clinic Booking — Express App
 * Defines middleware, routes, and error handling without starting the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();

app.use(helmet());

const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ||
  'http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080,http://localhost:5173'
).split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/sync', syncRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Clinic Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Smart Clinic Booking API',
    version: '1.0.0',
    description: 'Healthcare Management System with Live Token & Appointment Scheduling',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      patients: '/api/patients',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      tokens: '/api/tokens',
      sync: '/api/sync',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
