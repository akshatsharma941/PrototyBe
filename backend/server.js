const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const caseStudyRoutes = require('./routes/caseStudies');
const tutorRoutes = require('./routes/tutor');
const evalRoutes = require('./routes/eval');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    } else {
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB Memory Server connected at', uri);
      
      // Seed data into memory server
      const seedData = require('./seedData');
      const CaseStudy = require('./models/CaseStudy');
      await CaseStudy.deleteMany({});
      await CaseStudy.insertMany(seedData);
      console.log('Seeded initial case studies into memory server');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectDB();

// Routes
const executeRoutes = require('./routes/execute');


app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/eval', evalRoutes);
app.use('/api/execute', executeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PyBe Backend is running' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
