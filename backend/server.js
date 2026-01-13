const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
        console.error(`Please stop the existing server or check your task manager for Node.js processes.`);
        process.exit(1);
    } else {
        throw err;
    }
});
