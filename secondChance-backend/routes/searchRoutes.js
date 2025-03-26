const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../models/db');

/**
 * Route de recherche avancée des items par mot-clé dans le nom ou la description
 */
router.get('/', async (req, res, next) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        // Vérification de la requête
        if (!q || !q.trim()) {
            return res.status(400).json({ message: '❌ La requête de recherche ne peut pas être vide.' });
        }

        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');

        // Pagination
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;

        // Utilisation d'un index textuel pour une recherche rapide
        const results = await collection.find({ $text: { $search: q } })
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const total = await collection.countDocuments({ $text: { $search: q } });

        res.json({ total, page: pageNumber, results });
    } catch (error) {
        console.error('❌ Erreur dans la recherche :', error.stack);
        next(error);
    }
});

module.exports = router;
