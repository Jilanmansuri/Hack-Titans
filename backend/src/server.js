const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/api');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const interviewRoutes = require('./routes/interview');

app.use('/api', routes);
app.use('/api/interview', interviewRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
