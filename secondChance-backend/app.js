// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./logger');
const { connectToDatabase } = require('./models/db');

const authRoutes = require('./routes/authRoutes');
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const port = 3060;
// 🔥 IMPORTANT : Permet d'extraire JSON depuis les requêtes
app.use(express.urlencoded({ extended: true })); 

// ✅ Middleware globaux
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Permettre l'analyse des JSON
app.use(pinoHttp({ logger })); // Logging des requêtes

// ✅ Routes
app.use('/api/auth', authRoutes); // Routes d'authentification
app.use('/api/secondchance', secondChanceItemsRoutes); // Routes CRUD Items
app.use('/api/search', searchRoutes); // Route de recherche

// ✅ Route par défaut
app.get("/", (req, res) => {
    res.send("✅ API SecondChance Backend en ligne 🚀");
});

// ✅ Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ✅ Connexion à MongoDB et démarrage du serveur
connectToDatabase()
    .then(() => {
        console.log("✅ Connexion à MongoDB réussie !");
        app.listen(port, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("❌ Erreur de connexion à MongoDB :", err);
        process.exit(1); // Arrête l'application si la base de données est inaccessible
    });
