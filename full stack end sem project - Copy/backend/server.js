require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
const itemRoutes = require('./routes/items');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/items', itemRoutes);

// Database connection & Server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Using MongoMemoryServer for instant-setup testing
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log(`MongoDB InMemory successfully connected to: ${mongoUri}`);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server', error);
  }
};

startServer();
