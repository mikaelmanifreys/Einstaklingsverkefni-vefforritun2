require('dotenv').config();
const express = require('express');
const cors = require('cors');

const workoutsRouter = require('./routes/workouts');
const authRouter = require('./routes/auth');
const exercisesRouter = require('./routes/exercises');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://kraftur-vef2.netlify.app'
  ],
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.use('/api/workouts', workoutsRouter);
app.use('/api/auth', authRouter);
app.use('/api/exercises', exercisesRouter);

module.exports = app;