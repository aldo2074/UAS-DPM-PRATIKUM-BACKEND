const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const profileRoutes = require('./routes/profileRoutes');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // In production, replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add this middleware before your routes
app.use((req, res, next) => {
  // Ensure content type is set
  res.setHeader('Content-Type', 'application/json');
  
  // Override res.json to add logging
  const originalJson = res.json;
  res.json = function(data) {
    console.log('Response being sent:', data);
    return originalJson.call(this, data);
  };
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  const errorResponse = {
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  };

  console.log('Sending error response:', errorResponse);
  res.status(500).json(errorResponse);
});

module.exports = app;
