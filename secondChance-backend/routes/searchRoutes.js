const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../models/db');

// Recherche d'items par mot-clé sur le nom ou la description
router.get('/', async (req, res) => {
    const { q } = req.query; // Exemple : /api/search?q=chaise
    if (!q) return res.status(400).json({ message: '❌ Requête vide' });

    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');

        const results = await collection.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        }).toArray();

        res.json(results);
    } catch (error) {
        console.error('❌ Erreur dans la recherche :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
