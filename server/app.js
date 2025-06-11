const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes')
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser()); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user',userRoutes)

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

module.exports = app;