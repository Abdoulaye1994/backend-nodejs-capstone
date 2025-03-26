// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const authRoutes = require('./routes/authRoutes'); // Assurez-vous que le chemin est correct
const logger = require('./logger');


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

const pinoHttp = require('pino-http');


const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');


// ✅ Middlewares globaux
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Permet de lire les JSON dans les requêtes
app.use(pinoHttp({ logger })); // Logging des requêtes
app.use('/api/secondchance', secondChanceItemsRoutes);


// ✅ Vérifier la connexion à MongoDB avant de démarrer le serveur
connectToDatabase().then(() => {
    console.log("✅ Connexion à MongoDB réussie !");
}).catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
    process.exit(1); // Arrête l'application si la base de données est inaccessible
});

// ✅ Déclaration des routes
app.use('/api/secondchance', secondChanceItemsRoutes); // Routes CRUD Items
app.use('/api/search', searchRoutes); // Route de recherche

// ✅ Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ✅ Route par défaut
app.get("/", (req, res) => {
    res.send("✅ API SecondChance Backend en ligne 🚀");
});

// ✅ Démarrer le serveur uniquement après connexion MongoDB
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
