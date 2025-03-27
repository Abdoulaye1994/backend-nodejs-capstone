const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../models/db');

/**
 * Route de recherche avancée des items par mot-clé dans le nom ou la description
 */
router.get('/', async (req, res, next) => {
    try {
        let { q, page = 1, limit = 10 } = req.query;

        // Vérification de la requête
        if (!q || !q.trim()) {
            return res.status(400).json({ message: '❌ La requête de recherche ne peut pas être vide.' });
        }

        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');

        // Conversion sécurisée des paramètres
        const pageNumber = Math.max(1, parseInt(page)) || 1;
        const pageSize = Math.max(1, parseInt(limit)) || 10;
        const skip = (pageNumber - 1) * pageSize;

        // Vérifier que l'index textuel est bien en place
        const indexes = await collection.indexes();
        const hasTextIndex = indexes.some(idx => idx.name.includes('text'));

        if (!hasTextIndex) {
            return res.status(500).json({ message: '❌ L’index textuel est manquant. Veuillez contacter un administrateur.' });
        }

        // Requête de recherche avec projection pour limiter les champs retournés
        const results = await collection.find(
            { $text: { $search: q } },
            { projection: { score: { $meta: "textScore" }, nom: 1, description: 1 } }
        )
        .sort({ score: { $meta: "textScore" } }) // Trier par pertinence
        .skip(skip)
        .limit(pageSize)
        .toArray();

        // Compter le nombre total d'éléments trouvés
        const total = await collection.countDocuments({ $text: { $search: q } });

        res.json({ total, page: pageNumber, results });
    } catch (error) {
        console.error('❌ Erreur dans la recherche :', error.stack);
        next(error);
    }
});

module.exports = router;
