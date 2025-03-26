// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const authRoutes = require('./routes/authRoutes'); // Assurez-vous que le chemin est correct

const { connectToDatabase } = require('./models/db');
const { loadData } = require("./util/import-mongo/index");

const app = express();
app.use("*", cors());
const port = 3060;

// Connect to MongoDB
connectToDatabase().then(() => {
    console.log('✅ Connected to DB');
}).catch((e) => {
    console.error('❌ Failed to connect to DB', e);
});

app.use(express.json());

// ✅ Route files imports
// Auth Routes
app.use('/api/auth', authRoutes); // Assurez-vous que ce fichier existe et fonctionne

// Items API Routes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');

// Search API Routes
const searchRoutes = require('./routes/searchRoutes'); // Assurez-vous que ce fichier existe

// Logging
const pinoHttp = require('pino-http');
const logger = require('./logger');
app.use(pinoHttp({ logger }));

// ✅ Use Routes
app.use('/api/secondchance', secondChanceItemsRoutes); // Items CRUD routes
app.use('/api/search', searchRoutes); // Search route

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

// ✅ Default Route
app.get("/", (req, res) => {
    res.send("✅ API SecondChance Backend en ligne 🚀");
});

// ✅ Start Server
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
