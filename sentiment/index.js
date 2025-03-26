require('dotenv').config();  // Charger les variables d'environnement

const express = require('express');
const expressPino = require('express-pino-logger');
const natural = require("natural");
const pino = require('pino');
const pinoPretty = require('pino-pretty');

// Configuration du logger Pino avec pino-pretty pour des logs lisibles
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(expressPino({ logger }));

// 📌 Route d'analyse de sentiment
app.post('/sentiment', async (req, res) => {
    try {
        const { sentence } = req.query;

        if (!sentence) {
            logger.error('❌ Aucune phrase fournie');
            return res.status(400).json({ error: '❌ Aucune phrase fournie' });
        }

        // Initialiser l'analyseur de sentiment
        const Analyzer = natural.SentimentAnalyzer;
        const stemmer = natural.PorterStemmer;
        const analyzer = new Analyzer("English", stemmer, "afinn");

        // Analyse du sentiment
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        // Définition du sentiment (positif, neutre, négatif)
        let sentiment = "neutral";
        if (analysisResult < 0) sentiment = "negative";
        else if (analysisResult > 0.33) sentiment = "positive";

        logger.info(`✅ Analyse réussie: Score=${analysisResult}, Sentiment=${sentiment}`);

        // Répondre avec le résultat
        res.status(200).json({ sentimentScore: analysisResult, sentiment });
    } catch (error) {
        logger.error(`❌ Erreur lors de l'analyse: ${error}`);
        res.status(500).json({ error: 'Erreur lors de l\'analyse de sentiment' });
    }
});

app.get('/', (req, res) => {
    res.send('✅ Sentiment Analysis API is running! Use POST /sentiment to analyze text.');
});


// 📌 Démarrer le serveur
app.listen(port, () => {
    logger.info(`🚀 Serveur en cours d'exécution sur http://localhost:${port}`);
});
