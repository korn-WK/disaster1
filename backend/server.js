const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chatRoutes');

mongoose.connect('mongodb://localhost:27017/disaster', {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/chat', chatRoutes);

app.listen(5000, () => {
  console.log('Server running on Port 5000');
});